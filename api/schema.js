import twilio from 'twilio';
import {GraphQLDateTime} from 'graphql-iso-date';
import {PubSub, UserInputError, gql, withFilter} from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  type Query {
    nowServing: Customer
    customers(served: Boolean!): [Customer!]!
    organization: Organization
    phoneNumbers: [PhoneNumber!]!
    me: User!
  }

  type Mutation {
    serveCustomer(id: ID!): Customer!
    removeCustomer(id: ID!): Customer
    updateOrganization(input: UpdateOrganizationInput!): Organization!
  }

  type Subscription {
    customerAdded: Customer
    customerServed: Customer
    customerRemoved: Customer
    organizationUpdated: Organization
  }

  input UpdateOrganizationInput {
    accepting: Boolean
  }

  type Customer {
    id: ID!
    name: String!
    phone: String!
    waitingSince: DateTime!
    servedAt: DateTime
    servedBy: User
  }

  type Organization {
    id: ID!
    name: String!
    accepting: Boolean!
  }

  type User {
    id: ID!
    name: String!
    organization: Organization
  }

  type PhoneNumber {
    friendlyName: String!
    phoneNumber: String!
  }
`;

const CUSTOMER_ADDED = 'CUSTOMER_ADDED';
export const CUSTOMER_SERVED = 'CUSTOMER_SERVED';
export const CUSTOMER_REMOVED = 'CUSTOMER_REMOVED';
const ORGANIZATION_UPDATED = 'ORGANIZATION_UPDATED';

export const pubsub = new PubSub();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    nowServing: (parent, args, {db, user}) =>
      db('customers')
        .where('servedBy', user.id)
        .orderBy('servedAt', 'desc')
        .first(),
    customers(parent, args, {db, user}) {
      const query = db('customers')
        .where('organizationId', user.organizationId)
        [args.served ? 'whereNotNull' : 'whereNull']('servedAt')
        .orderBy(
          args.served ? 'servedAt' : 'waitingSince',
          args.served ? 'desc' : 'asc'
        );
      return args.served
        ? query.whereRaw('"servedAt" > now() - interval \'7 days\'')
        : query;
    },
    organization: (parent, args, {db, user}) =>
      db('organizations')
        .where('id', user.organizationId)
        .first(),
    phoneNumbers: () =>
      client.availablePhoneNumbers('US').tollFree.list({limit: 3}),
    me: (parent, args, {user}) => user
  },
  Subscription: {
    customerAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CUSTOMER_ADDED),
        (payload, args, {user}) =>
          payload.customerAdded.organizationId === user.organizationId
      )
    },
    customerServed: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CUSTOMER_SERVED),
        (payload, args, {user}) =>
          payload.customerServed.organizationId === user.organizationId
      )
    },
    customerRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CUSTOMER_REMOVED),
        (payload, args, {user}) =>
          payload.customerRemoved.organizationId === user.organizationId
      )
    },
    organizationUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ORGANIZATION_UPDATED),
        (payload, args, {user}) =>
          payload.organizationUpdated.id === user.organizationId
      )
    }
  },
  Mutation: {
    serveCustomer: async (parent, args, {db, user}) => {
      const [to] = await db('customers')
        .where(args)
        .andWhere('organizationId', user.organizationId)
        .pluck('phone');

      if (!to) {
        throw new UserInputError('Invalid customer');
      }

      const organization = await db('organizations')
        .where('id', user.organizationId)
        .first();

      const message = await client.messages.create({
        body: organization.readyMessage,
        from: organization.phone,
        to
      });

      const [customerServed] = await db('customers')
        .where(args)
        .update({
          receipt: message.sid,
          servedAt: new Date(),
          servedBy: user.id
        })
        .returning('*');

      pubsub.publish(CUSTOMER_SERVED, {customerServed});

      return customerServed;
    },
    removeCustomer: async (parent, args, {db, user}) => {
      const [customerRemoved] = await db('customers')
        .where(args)
        .andWhere('organizationId', user.organizationId)
        .del()
        .returning('*');

      if (!customerRemoved) {
        throw new UserInputError('Invalid customer');
      }

      pubsub.publish(CUSTOMER_REMOVED, {customerRemoved});

      return customerRemoved;
    },
    updateOrganization: async (parent, {input}, {db, user}) => {
      const [organizationUpdated] = await db('organizations')
        .where('id', user.organizationId)
        .update(input)
        .returning('*');

      pubsub.publish(ORGANIZATION_UPDATED, {organizationUpdated});

      return organizationUpdated;
    }
  },
  Customer: {
    servedBy: (customer, args, {db}) =>
      customer.servedBy &&
      db('users')
        .where('id', customer.servedBy)
        .first()
  },
  User: {
    organization: (user, args, {db}) =>
      db('organizations')
        .where('id', user.organizationId)
        .first()
  }
};
