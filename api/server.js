const express = require('express');
const twilio = require('twilio');
const knex = require('knex');
const cors = require('cors');
const expand = require('expand-template')();
const pluralize = require('pluralize');
const basicAuth = require('basic-auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  ApolloServer,
  gql,
  PubSub,
  AuthenticationError
} = require('apollo-server-express');

const db = knex(process.env.DATABASE_URL);

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const pubsub = new PubSub();
const app = express();

const origin =
  process.env.NODE_ENV === 'production'
    ? 'https://sorrentobarbers.com'
    : 'http://localhost:8000';

app.use(cors({origin}));
app.use(express.urlencoded({extended: false}));

app.get('/auth', async (req, res) => {
  const credentials = basicAuth(req);

  try {
    const user = await db('users')
      .where('username', credentials.name)
      .first();

    if (!user || !bcrypt.compareSync(credentials.pass, user.password)) {
      throw new Error('Unauthorized');
    }

    const token = jwt.sign({name: user.name}, process.env.JWT_SECRET, {
      subject: user.id.toString()
    });

    res.send(token);
  } catch (error) {
    res.sendStatus(401);
  }
});

app.post('/sms', async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const organization = await db('organizations')
    .where('phone', req.body.To)
    .first();

  if (req.body.Body === organization.keyword) {
    const condition = {
      servedAt: null,
      phone: req.body.From,
      organizationId: organization.id
    };

    const matches = await db('customers').where(condition);

    if (matches.length) {
      const [customer] = await db('customers')
        .where(condition)
        .del()
        .returning('*');

      twiml.message(organization.removedMessage);
      pubsub.publish('customer', {
        mutation: 'DELETE',
        data: customer
      });
    } else {
      twiml.message(organization.notRemovedMessage);
    }
  } else {
    if (organization.accepting) {
      const [customer] = await db('customers')
        .insert({
          name: req.body.Body,
          phone: req.body.From,
          organizationId: organization.id
        })
        .returning('*');

      const customers = await db('customers')
        .whereNull('servedAt')
        .andWhere('organizationId', organization.id);

      // this value is calculated based on an EWT equation found here
      // https://developer.mypurecloud.com/api/rest/v2/routing/estimatedwaittime.html#methods_of_calculating_ewt
      const peopleAhead = customers.length - 1;
      const estimatedWaitTime = Math.round(
        (organization.averageHandleTime * peopleAhead) /
          organization.activeAgents
      );

      const message = expand(organization.welcomeMessage, {
        QUEUE_MESSAGE:
          customers.length > 1
            ? expand(organization.queueMessage, {
                IS: pluralize('is', peopleAhead),
                PERSON: pluralize(organization.person, peopleAhead, true),
                ESTIMATED_WAIT_TIME: estimatedWaitTime
              })
            : organization.queueEmptyMessage,
        KEYWORD: organization.keyword
      });

      twiml.message(message);

      // broadcast new customer list to all connected clients
      pubsub.publish('customer', {
        mutation: 'CREATE',
        data: customer
      });
    } else {
      twiml.message(organization.notAcceptingMessage);
    }
  }

  // send SMS reply
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

const typeDefs = gql`
  type Query {
    customers: [Customer!]!
  }

  type Subscription {
    customer: CustomerSubscriptionPayload!
    organization: Organization!
  }

  type CustomerSubscriptionPayload {
    mutation: String!
    customer: Customer!
  }

  type Mutation {
    serveCustomer(id: ID!): Customer!
    deleteCustomer(id: ID!): Customer!
    updateOrganization($input: UpdateOrganizationInput!): Organization!
  }

  input UpdateOrganizationInput {
    accepting: Boolean
  }

  type Customer {
    id: ID!
    name: String!
  }

  type Organization {
    id: ID!
    accepting: Boolean!
  }
`;

const resolvers = {
  Query: {
    customers: (parent, args, {db, user}) =>
      db('customers').where('organizationId', user.organizationId)
  },
  Subscription: {
    customer: {
      subscribe: () => pubsub.asyncIterator('customer')
    },
    organization: {
      subscribe: () => pubsub.asyncIterator('organization')
    }
  },
  Mutation: {
    serveCustomer: async (parent, args, {user}) => {
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

      const [customer] = await db('customers')
        .where(args)
        .update({
          receipt: message.sid,
          servedAt: new Date(),
          servedBy: user.id
        })
        .returning('*');

      pubsub.publish('customer', {
        mutation: 'UPDATE',
        data: customer
      });

      return customer;
    },
    deleteCustomer: async (parent, args, {user}) => {
      const [customer] = await db('customers')
        .where(args)
        // TODO: verify that customer is part of org/exists
        .andWhere('organizationId', user.organizationId)
        .del()
        .returning('*');

      pubsub.publish('customer', {
        mutation: 'DELETE',
        data: customer
      });

      return customer;
    },
    updateOrganization: async (parent, {input}, {user}) => {
      const [organization] = await db('organizations')
        .where('id', user.organizationId)
        .update(input)
        .returning('*');
      pubsub.publish('organization', organization);
      return organization;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    onConnect: async ({authToken}) => {
      if (!authToken) {
        throw new Error('Missing auth token');
      }

      const {sub} = jwt.verify(authToken, process.env.JWT_SECRET);
      const user = await db('users')
        .where('id', sub)
        .first();
      if (!user) {
        throw new Error('Invalid token');
      }

      return {user};
    }
  },
  context: async ({req, connection}) => {
    if (connection) {
      return connection.context;
    }

    const matches = req.headers.authorization.match(/^bearer (\S+)$/i);
    const {sub} = jwt.verify(matches[1], process.env.JWT_SECRET);
    const user = await db('users')
      .where('id', sub)
      .first();

    if (!user) {
      throw new AuthenticationError('Unauthorized');
    }

    return {user};
  }
});

server.applyMiddleware({app});

app.listen({port: process.env.PORT}, () => {
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
  );
});
