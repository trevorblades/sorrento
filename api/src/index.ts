import * as jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { Barber, Customer, sequelize } from "./db.js";
import { DateTimeResolver } from "graphql-scalars";
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

const pubsub = new PubSub();

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

await sequelize.sync();

await new Promise<void>((resolve) =>
  httpServer.listen({ port: process.env.PORT }, resolve)
);

console.log(
  `💈 Server started on http://localhost:${process.env.PORT}/graphql`
);
