const express = require('express');
const {MessagingResponse} = require('twilio').twiml;
const knex = require('knex');
const http = require('http');
const cors = require('cors');
const expand = require('expand-template')();
const pluralize = require('pluralize');
const basicAuth = require('basic-auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  typeDefs,
  resolvers,
  pubsub,
  CUSTOMER_UPDATED,
  CUSTOMER_REMOVED
} = require('./schema');
const {ApolloServer, AuthenticationError} = require('apollo-server-express');

const db = knex(process.env.DATABASE_URL);
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
  const twiml = new MessagingResponse();

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
      pubsub.publish(CUSTOMER_REMOVED, customer);
    } else {
      twiml.message(organization.notRemovedMessage);
    }
  } else {
    if (organization.accepting) {
      const [customerAdded] = await db('customers')
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
      pubsub.publish(CUSTOMER_UPDATED, {customerAdded});
    } else {
      twiml.message(organization.notAcceptingMessage);
    }
  }

  // send SMS reply
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

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

      return {
        db,
        user
      };
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

    return {
      db,
      user
    };
  }
});

server.applyMiddleware({app});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(process.env.PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`
  );
});
