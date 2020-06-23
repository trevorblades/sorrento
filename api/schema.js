import Stripe from 'stripe';
import twilio from 'twilio';
import {
  ForbiddenError,
  PubSub,
  UserInputError,
  gql,
  withFilter
} from 'apollo-server-express';
import {GraphQLDateTime} from 'graphql-iso-date';

export const typeDefs = gql`
  scalar DateTime

  type Query {
    organization(id: ID!): Organization!
    organizations: [Organization!]!
    phoneNumbers(limit: Int!): [PhoneNumber!]!
    me: User!
  }

  type Mutation {
    serveCustomer(id: ID!): Customer!
    removeCustomer(id: ID!): Customer
    createOrganization(input: CreateOrganizationInput!): Organization!
    updateOrganization(input: UpdateOrganizationInput!): Organization!
  }

  type Subscription {
    customerAdded: Customer
    customerServed: Customer
    customerRemoved: Customer
    organizationUpdated: Organization
  }

  input CreateOrganizationInput {
    name: String!
    phone: String!
    source: String!
    plan: String!
  }

  input UpdateOrganizationInput {
    id: ID!
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
    phone: String!
    customers(served: Boolean!): [Customer!]!
    accepting: Boolean!
    queueLimit: Int!
    averageHandleTime: Int!
    activeAgents: Int!
    keyword: String!
    person: String!
    welcomeMessage: String!
    queueMessage: String!
    queueEmptyMessage: String!
    notAcceptingMessage: String!
    readyMessage: String!
    removedMessage: String!
    notRemovedMessage: String!
    limitExceededMessage: String!
  }

  type User {
    id: ID!
    name: String!
    nowServing: Customer
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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function findOrCreateCustomer({db, user, source}) {
  if (user.customerId) {
    return stripe.customers.retrieve(user.customerId);
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    source
  });

  await db('users')
    .update('customerId', customer.id)
    .where('id', user.id);

  return customer;
}

export const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    organizations: (parent, args, {db, user}) =>
      db('organizations')
        .join('members', 'organizations.id', '=', 'members.organizationId')
        .where('members.userId', user.id),
    async organization(parent, {id}, {db, user}) {
      const organizations = await db('members')
        .where('userId', user.id)
        .pluck('organizationId');

      if (!organizations.includes(id)) {
        throw new ForbiddenError('You do not have access to this organization');
      }

      return db('organizations')
        .where({id})
        .first();
    },
    phoneNumbers: (parent, {limit}) =>
      client.availablePhoneNumbers('US').tollFree.list({limit}),
    me: (parent, args, {user}) => user
  },
  Subscription: {
    customerAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CUSTOMER_ADDED),
        (payload, args, {organizations}) =>
          organizations.includes(payload.customerAdded.organizationId)
      )
    },
    customerServed: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CUSTOMER_SERVED),
        (payload, args, {organizations}) =>
          organizations.includes(payload.customerServed.organizationId)
      )
    },
    customerRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CUSTOMER_REMOVED),
        (payload, args, {organizations}) =>
          organizations.includes(payload.customerRemoved.organizationId)
      )
    },
    organizationUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ORGANIZATION_UPDATED),
        (payload, args, {organizations}) =>
          organizations.includes(payload.organizationUpdated.id)
      )
    }
  },
  Mutation: {
    async serveCustomer(parent, args, {db, user}) {
      const query = db('customers').where(args);
      const customer = await query.first();

      if (!customer) {
        throw new UserInputError('Invalid customer');
      }

      const organization = await db('organizations')
        .where({
          id: customer.organizationId,
          owner: user.id
        })
        .first();

      if (!organization) {
        throw new ForbiddenError('You do not have access to this customer');
      }

      const message = await client.messages.create({
        body: organization.readyMessage,
        from: organization.phone,
        to: customer.phone
      });

      const [customerServed] = await query
        .update({
          receipt: message.sid,
          servedAt: new Date(),
          servedBy: user.id
        })
        .returning('*');

      pubsub.publish(CUSTOMER_SERVED, {customerServed});

      return customerServed;
    },
    async removeCustomer(parent, args, {db, user}) {
      const query = db('customers').where(args);
      const [id] = await query.pluck('organizationId');
      const [owner] = await db('organizations')
        .where({id})
        .pluck('owner');

      if (owner !== user.id) {
        throw new ForbiddenError('You do not have access to this customer');
      }

      const [customerRemoved] = await query.del().returning('*');

      pubsub.publish(CUSTOMER_REMOVED, {customerRemoved});

      return customerRemoved;
    },
    async createOrganization(parent, {input}, {db, user}) {
      const customer = await findOrCreateCustomer({
        db,
        user,
        source: input.source
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{plan: input.plan}]
      });

      // TODO: register phone number

      const [organization] = await db('organizations')
        .insert({
          name: input.name,
          phone: input.phone,
          owner: user.id,
          subscriptionId: subscription.id
        })
        .returning('*');

      await db('members').insert({
        userId: user.id,
        organizationId: organization.id
      });

      return organization;
    },
    async updateOrganization(parent, args, {db, user}) {
      const organizations = await db('members')
        .where({
          admin: true,
          userId: user.id
        })
        .pluck('organizationId');

      const {id, ...input} = args.input;
      if (!organizations.includes(id)) {
        throw new ForbiddenError('You do not have access to this organization');
      }

      const [organizationUpdated] = await db('organizations')
        .where({id})
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
  Organization: {
    async customers(organization, {served}, {db, user}) {
      const organizations = await db('members')
        .where('userId', user.id)
        .pluck('organizationId');

      if (!organizations.includes(organization.id)) {
        throw new ForbiddenError('You do not have access to these customers');
      }

      const query = db('customers')
        .where('organizationId', organization.id)
        [served ? 'whereNotNull' : 'whereNull']('servedAt')
        .orderBy(served ? 'servedAt' : 'waitingSince', served ? 'desc' : 'asc');
      return served
        ? query.whereRaw('"servedAt" > now() - interval \'7 days\'')
        : query;
    }
  },
  User: {
    nowServing: (user, args, {db}) =>
      db('customers')
        .where('servedBy', user.id)
        .orderBy('servedAt', 'desc')
        .first()
  }
};
