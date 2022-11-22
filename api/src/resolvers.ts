import twilio from "twilio";
import {
  ACCEPTING_CHANGED,
  CUSTOMER_ADDED,
  CUSTOMER_REMOVED,
  CUSTOMER_UPDATED,
} from "./subscriptions";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { Barber, Customer, Message } from "./db";
import { DateTimeResolver } from "graphql-scalars";
import { GraphQLError } from "graphql";
import { Redis } from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { Resolvers } from "./generated/graphql";
import { default as bcrypt } from "bcryptjs";
import { default as jwt } from "jsonwebtoken";
import { parsePhoneNumber } from "awesome-phonenumber";

const PHONE_NUMBER = "+16043308137";
export const IS_ACCEPTING_KEY = "accepting";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export type ContextType = {
  user: Barber | null;
  redisClient: Redis;
  pubsub: RedisPubSub;
};

export const resolvers: Resolvers<ContextType> = {
  DateTime: DateTimeResolver,
  Query: {
    me: (_, __, { user }) => user,
    customers: () =>
      Customer.findAll({
        where: {
          servedAt: null,
        },
      }),
    isAccepting: async (_, __, { redisClient }) => {
      const isAccepting = await redisClient.get(IS_ACCEPTING_KEY);
      return isAccepting === "true";
    },
  },
  Subscription: {
    acceptingChanged: {
      subscribe: (_, __, { pubsub }) => ({
        [Symbol.asyncIterator]: () => pubsub.asyncIterator(ACCEPTING_CHANGED),
      }),
    },
    customerAdded: {
      subscribe: (_, __, { pubsub }) => ({
        [Symbol.asyncIterator]: () => pubsub.asyncIterator(CUSTOMER_ADDED),
      }),
    },
    customerUpdated: {
      subscribe: (_, __, { pubsub }) => ({
        [Symbol.asyncIterator]: () => pubsub.asyncIterator(CUSTOMER_UPDATED),
      }),
    },
    customerRemoved: {
      subscribe: (_, __, { pubsub }) => ({
        [Symbol.asyncIterator]: () => pubsub.asyncIterator(CUSTOMER_REMOVED),
      }),
    },
  },
  Mutation: {
    async logIn(_, { username, password }) {
      const user = await Barber.findOne({ where: { username } });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new GraphQLError("Incorrect username/password combination", {
          extensions: {
            code: "UNAUTHORIZED",
          },
        });
      }

      return jwt.sign({ name: user.name }, process.env.JWT_SECRET!, {
        subject: user.id.toString(),
      });
    },
    setAccepting: async (_, { accepting }, { redisClient, pubsub }) => {
      await redisClient.set(IS_ACCEPTING_KEY, accepting.toString());
      pubsub.publish(ACCEPTING_CHANGED, { acceptingChanged: accepting });
      return accepting;
    },
    async serveCustomer(_, { id }, { user, pubsub }) {
      const customer = await Customer.findByPk(id);

      if (!customer) {
        throw new GraphQLError("Invalid customer", {
          extensions: {
            code: ApolloServerErrorCode.BAD_USER_INPUT,
          },
        });
      }

      const message = await twilioClient.messages.create({
        body: "Your barber is ready to serve you! Please head over to Sorrento to meet your barber.",
        from: PHONE_NUMBER,
        to: customer.phone,
      });

      await customer.update({
        receipt: message.sid,
        servedAt: new Date(),
        barberId: user?.id,
      });

      pubsub.publish(CUSTOMER_REMOVED, { customerRemoved: customer });

      return customer;
    },
    async removeCustomer(_, { id }, { pubsub }) {
      const customer = await Customer.findByPk(id);

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
    phone: (customer) => {
      const { number } = parsePhoneNumber(customer.phone);
      return number?.national || customer.phone;
    },
    waitingSince: (customer) => customer.createdAt,
    servedBy: (customer) =>
      Barber.findOne({ where: { id: customer.barberId } }),
    messages: (customer) =>
      Message.findAll({ where: { customerId: customer.id } }),
  },
  Message: {
    sentAt: (message) => message.createdAt,
  },
};
