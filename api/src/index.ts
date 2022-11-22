import Redis from "ioredis";
import bodyParser from "body-parser";
import cors from "cors";
import express, { urlencoded } from "express";
import http from "http";
import pluralize from "pluralize";
import twilio from "twilio";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { Barber, Customer, Message, sequelize } from "./db.js";
import {
  CUSTOMER_ADDED,
  CUSTOMER_REMOVED,
  CUSTOMER_UPDATED,
} from "./subscriptions.js";
import { ContextType, IS_ACCEPTING_KEY, resolvers } from "./resolvers.js";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { WebSocketServer } from "ws";
import { applyMiddleware } from "graphql-middleware";
import { expressMiddleware } from "@apollo/server/express4";
import { default as jwt } from "jsonwebtoken";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { permissions } from "./permissions.js";
import { readFileSync } from "fs";
import { useServer } from "graphql-ws/lib/use/ws";

const app = express();
const httpServer = http.createServer(app);

const typeDefs = readFileSync("./schema.graphql", { encoding: "utf-8" });

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const createClient = () => new Redis(process.env.REDIS_URL!);

const redisClient = createClient();

const pubsub = new RedisPubSub({
  publisher: createClient(),
  subscriber: createClient(),
});

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer(
  {
    schema,
    context: {
      redisClient,
      pubsub,
    },
  },
  wsServer
);

const server = new ApolloServer<ContextType>({
  introspection: true,
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
  cors<cors.CorsRequest>({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://sorrentobarbers.com", "https://sorrento.vercel.app"]
        : "*",
  })
);

app.use(
  "/graphql",
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      let user = null;

      try {
        const matches = req.headers.authorization?.match(/^bearer (\S+)$/i);

        if (!matches) {
          throw new Error("Auth token not provided");
        }

        const decoded = jwt.verify(matches[1], process.env.JWT_SECRET!);

        if (typeof decoded === "string") {
          throw new Error("Invalid token");
        }

        user = await Barber.findByPk(decoded.sub);
      } catch {
        // do nothing
      }

      return {
        user,
        redisClient,
        pubsub,
      };
    },
  })
);

export const KEYWORD = "REMOVE";
export const AVERAGE_HANDLE_TIME = 40;
export const ACTIVE_AGENTS = 3;
export const MAX_QUEUE_SIZE = 10;

// twilio webhook
app.post("/sms", urlencoded({ extended: false }), async (req, res) => {
  const messagingResponse = new twilio.twiml.MessagingResponse();

  switch (req.body.Body.trim().toLowerCase()) {
    // if the message contains the keyword, remove the customer
    case KEYWORD.toLowerCase(): {
      const customer = await Customer.findOne({
        where: {
          servedAt: null,
          phone: req.body.From,
        },
      });

      if (!customer) {
        messagingResponse.message("You are not on the list.");
        break;
      }

      await customer.destroy();
      pubsub.publish(CUSTOMER_REMOVED, { customerRemoved: customer });
      messagingResponse.message("You have been removed from the list.");

      break;
    }
    default: {
      const isAccepting = await redisClient.get(IS_ACCEPTING_KEY);
      // otherwise, check to see if the barber is accepting customers
      if (isAccepting !== "true") {
        // if not, send a message saying so
        messagingResponse.message(
          "We have stopped accepting customers for today. Please visit https://sorrentobarbers.com for our store hours."
        );

        break;
      }

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
        break;
      }

      const peopleAhead = await Customer.count({
        where: {
          servedAt: null,
        },
      });

      // if there's any space in the queue, add the customer to the list
      if (peopleAhead >= MAX_QUEUE_SIZE) {
        messagingResponse.message(
          "The list is currently full. Please try again later."
        );
        break;
      }

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

      const customerAdded = await Customer.create({
        name: req.body.Body,
        phone: req.body.From,
      });

      pubsub.publish(CUSTOMER_ADDED, { customerAdded });
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
