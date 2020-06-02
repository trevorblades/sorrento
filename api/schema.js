const {GraphQLDateTime} = require('graphql-iso-date');
const {gql, PubSub, withFilter} = require('apollo-server-express');
const twilio = require('twilio');

exports.typeDefs = gql`
  scalar DateTime

  type Query {
    customers: [Customer!]!
    organization: Organization!
  }

  type Subscription {
    customerAdded: Customer
    customerUpdated: Customer
    customerRemoved: Customer
    organizationUpdated: Organization
  }

  type Mutation {
    serveCustomer(id: ID!): Customer!
    deleteCustomer(id: ID!): Customer!
    updateOrganization(input: UpdateOrganizationInput!): Organization!
  }

  input UpdateOrganizationInput {
    accepting: Boolean
  }

  type Customer {
    id: ID!
    name: String!
    waitingSince: DateTime!
    servedAt: DateTime
  }

  type Organization {
    id: ID!
    accepting: Boolean!
  }
`;

const CUSTOMER_ADDED = 'CUSTOMER_ADDED';
const CUSTOMER_UPDATED = 'CUSTOMER_UPDATED';
const CUSTOMER_REMOVED = 'CUSTOMER_REMOVED';
const ORGANIZATION_UPDATED = 'ORGANIZATION_UPDATED';

exports.CUSTOMER_UPDATED;
exports.CUSTOMER_REMOVED;

const pubsub = new PubSub();
exports.pubsub = pubsub;

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    customers: (parent, args, {db, user}) =>
      db('customers').where('organizationId', user.organizationId),
    organization: (parent, args, {db, user}) =>
      db('organizations')
        .where('id', user.organizationId)
        .first()
  },
  Subscription: {
    customerAdded: {
      subscribe: () => pubsub.asyncIterator(CUSTOMER_ADDED)
    },
    customerUpdated: {
      subscribe: () => pubsub.asyncIterator(CUSTOMER_UPDATED)
    },
    customerRemoved: {
      subscribe: () => pubsub.asyncIterator(CUSTOMER_REMOVED)
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
        // TODO: verify that customer is part of org/exists
        .pluck('phone');

      const organization = await db('organizations')
        .where('id', user.organizationId)
        .first();

      const message = await client.messages.create({
        body: organization.readyMessage,
        from: organization.phone,
        to
      });

      const [customerUpdated] = await db('customers')
        .where(args)
        .update({
          receipt: message.sid,
          servedAt: new Date(),
          servedBy: user.id
        })
        .returning('*');

      pubsub.publish(CUSTOMER_UPDATED, {customerUpdated});

      return customerUpdated;
    },
    deleteCustomer: async (parent, args, {db, user}) => {
      const [customerRemoved] = await db('customers')
        .where(args)
        // TODO: verify that customer is part of org/exists
        .andWhere('organizationId', user.organizationId)
        .del()
        .returning('*');

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
  }
};
