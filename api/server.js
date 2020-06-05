import basicAuth from 'basic-auth';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import expand from 'expand-template';
import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import knex from 'knex';
import pluralize from 'pluralize';
import twilio from 'twilio';
import {ApolloServer, AuthenticationError} from 'apollo-server-express';
import {
  CUSTOMER_REMOVED,
  CUSTOMER_SERVED,
  pubsub,
  resolvers,
  typeDefs
} from './schema';

const db = knex(process.env.DATABASE_URL);
const app = express();
const template = expand();

const origin =
  process.env.NODE_ENV === 'production'
    ? 'https://sorrentobarbers.com'
    : /http:\/\/localhost:\d{4}/;

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

  if (req.body.Body.trim().toUpperCase() === organization.keyword) {
    const condition = {
      servedAt: null,
      phone: req.body.From,
      organizationId: organization.id
    };

    const matches = await db('customers').where(condition);

    if (matches.length) {
      const [customerRemoved] = await db('customers')
        .where(condition)
        .del()
        .returning('*');

      twiml.message(organization.removedMessage);
      pubsub.publish(CUSTOMER_REMOVED, {customerRemoved});
    } else {
      twiml.message(organization.notRemovedMessage);
    }
  } else {
    if (organization.accepting) {
      const {count: peopleAhead} = await db('customers')
        .count('id')
        .whereNull('servedAt')
        .andWhere('organizationId', organization.id)
        .first();

      if (peopleAhead < organization.queueLimit) {
        // this value is calculated based on an EWT equation found here
        // https://developer.mypurecloud.com/api/rest/v2/routing/estimatedwaittime.html#methods_of_calculating_ewt
        const estimatedWaitTime = Math.round(
          (organization.averageHandleTime * peopleAhead) /
            organization.activeAgents
        );

        const message = template(organization.welcomeMessage, {
          QUEUE_MESSAGE: peopleAhead
            ? template(organization.queueMessage, {
                IS: pluralize('is', peopleAhead),
                PERSON: pluralize(organization.person, peopleAhead, true),
                ESTIMATED_WAIT_TIME: estimatedWaitTime
              })
            : organization.queueEmptyMessage,
          KEYWORD: organization.keyword
        });

        twiml.message(message);

        const [customerServed] = await db('customers')
          .insert({
            name: req.body.Body,
            phone: req.body.From,
            organizationId: organization.id
          })
          .returning('*');

        pubsub.publish(CUSTOMER_SERVED, {customerServed});
      } else {
        twiml.message(organization.limitExceededMessage);
      }
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
