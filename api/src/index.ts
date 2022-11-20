import * as jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import pluralize from "pluralize";
import twilio from "twilio";
import { ApolloServer } from "@apollo/server";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { Barber, Customer, Message, sequelize } from "./db.js";
import { DateTimeResolver } from "graphql-scalars";
import { GraphQLError } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { Resolvers } from "./generated/graphql.js";
import { WebSocketServer } from "ws";
import { applyMiddleware } from "graphql-middleware";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { permissions } from "./permissions.js";
import { readFileSync } from "fs";
import { useServer } from "graphql-ws/lib/use/ws";

const app = express();
const httpServer = http.createServer(app);

const typeDefs = readFileSync("./schema.graphql", { encoding: "utf-8" });

const CUSTOMER_ADDED = "CUSTOMER_ADDED";
const CUSTOMER_UPDATED = "CUSTOMER_UPDATED";
const CUSTOMER_REMOVED = "CUSTOMER_REMOVED";

const IS_ACCEPTING = true; // TODO: wire this up to the DB
const KEYWORD = "REMOVE";
const AVERAGE_HANDLE_TIME = 40;
const ACTIVE_AGENTS = 3;
const MAX_QUEUE_SIZE = 10;

const pubsub = new PubSub();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const resolvers: Resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    me: (_, __, { user }) => user,
    customers: () => Customer.findAll(),
  },
  Subscription: {
    customerAdded: {
      subscribe: () => ({
        [Symbol.asyncIterator]: () => pubsub.asyncIterator(CUSTOMER_ADDED),
      }),
    },
    customerUpdated: {
      subscribe: () => ({
        [Symbol.asyncIterator]: () => pubsub.asyncIterator(CUSTOMER_UPDATED),
      }),
    },
    customerRemoved: {
      subscribe: () => ({
        [Symbol.asyncIterator]: () => pubsub.asyncIterator(CUSTOMER_REMOVED),
      }),
    },
  },
  Mutation: {
    async serveCustomer(_, args, { user }) {
      const customer = await Customer.findByPk(args.id);

      if (!customer) {
        throw new GraphQLError("Invalid customer", {
          extensions: {
            code: ApolloServerErrorCode.BAD_USER_INPUT,
          },
        });
      }

      const message = await twilioClient.messages.create({
        body: "Your barber is ready to serve you! Please head over to Sorrento to meet your barber.",
        from: "+16043308137",
        to: customer.phone,
      });

      await customer.update({
        receipt: message.sid,
        servedAt: new Date(),
        servedBy: user.id,
      });

      pubsub.publish(CUSTOMER_REMOVED, { customerRemoved: customer });

      return customer;
    },
    async removeCustomer(parent, args, { db }) {
      const customer = await Customer.findByPk(args.id);

      if (!customer) {
        throw new GraphQLError("Invalid customer", {
          extensions: {
            code: ApolloServerErrorCode.BAD_USER_INPUT,
          },
        });
      }

      await customer.destroy();

      pubsub.publish(CUSTOMER_REMOVED, { customerRemoved: customer });

      return customer;
    },
  },
  Barber: {
    nowServing: (barber) =>
      Customer.findOne({
        where: {
          barberId: barber.id,
        },
        order: [["createdAt", "DESC"]],
      }),
  },
  Customer: {
    waitingSince: (customer) => customer.createdAt,
    servedBy: (customer) => customer.$get("servedBy"),
    messages: (customer) => customer.$get("messages"),
  },
};

const schema = makeExecutableSchema({
  typeDefs: [typeDefs],
  resolvers,
});

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema: applyMiddleware(schema, permissions),
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();

app.use(
  "/graphql",
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      try {
        const matches = req.headers.authorization.match(/^bearer (\S+)$/i);
        const decoded = jwt.verify(matches[1], process.env.JWT_SECRET);

        if (typeof decoded === "string") {
          throw new Error("Invalid token");
        }

        const user = await Barber.findByPk(decoded.sub);
        return {
          user,
        };
      } catch {
        return {
          user: null,
        };
      }
    },
  })
);

// twilio webhook
app.post("/sms", async (req, res) => {
  const messagingResponse = new twilio.twiml.MessagingResponse();

  // if the message contains the keyword, remove the customer
  if (req.body.Body.trim().toLowerCase() === KEYWORD.toLowerCase()) {
    const customer = await Customer.findOne({
      where: {
        servedAt: null,
        phone: req.body.From,
      },
    });

    if (customer) {
      await customer.destroy();
      pubsub.publish(CUSTOMER_REMOVED, { customerRemoved: customer });
      messagingResponse.message("You have been removed from the list.");
    } else {
      messagingResponse.message("You are not on the list.");
    }
  } else {
    // otherwise, check to see if the barber is accepting customers
    if (!IS_ACCEPTING) {
      // if not, send a message saying so
      messagingResponse.message(
        "We have stopped accepting customers for today. Please visit https://sorrentobarbers.com for our store hours."
      );
    } else {
      // otherwise, add the customer to the list
      const customer = await Customer.findOne({
        where: {
          servedAt: null,
          phone: req.body.From,
        },
      });

      if (customer) {
        // if the customer is already on the list, treat this text as a message
        await Message.create({
          text: req.body.Body,
          customerId: customer.id,
        });

        pubsub.publish(CUSTOMER_UPDATED, { customerUpdated: customer });

        // no need to send a message back to the customer
        return;
      }

      const peopleAhead = await Customer.count({
        where: {
          servedAt: null,
        },
      });

      // if there's any space in the queue, add the customer to the list
      if (peopleAhead < MAX_QUEUE_SIZE) {
        /**
         * This value is calculated based on an EWT equation found here:
         * https://developer.mypurecloud.com/api/rest/v2/routing/estimatedwaittime.html#methods_of_calculating_ewt
         */
        const estimatedWaitTime = Math.round(
          (AVERAGE_HANDLE_TIME * peopleAhead) / ACTIVE_AGENTS
        );

        const welcomeMessage = [
          "Hello! You are on the list.",
          peopleAhead > 0
            ? `There ${pluralize("is", peopleAhead)} ${pluralize(
                "person",
                peopleAhead,
                true
              )} ahead of you. The approximate wait time is ${estimatedWaitTime} minutes.`
            : "There is nobody ahead of you.",
          `We will text you when you're up next. Reply "${KEYWORD}" at any time to remove yourself from the list. This is an automated response, so we can not reply to your questions.`,
        ];

        messagingResponse.message(welcomeMessage.join(" "));

        const customer = await Customer.create({
          name: req.body.Body,
          phone: req.body.From,
        });

        pubsub.publish(CUSTOMER_ADDED, { customerAdded: customer });
      } else {
        messagingResponse.message(
          "The list is currently full. Please try again later."
        );
      }
    }
  }

  // send SMS reply
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(messagingResponse.toString());
});

await sequelize.sync();

await new Promise<void>((resolve) =>
  httpServer.listen({ port: process.env.PORT }, resolve)
);

console.log(
  `💈 Server started on http://localhost:${process.env.PORT}/graphql`
);
