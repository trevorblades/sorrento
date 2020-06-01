const express = require('express');
const http = require('http');
const twilio = require('twilio');
const knex = require('knex');
const cors = require('cors');
const expand = require('expand-template')();
const pluralize = require('pluralize');
const basicAuth = require('basic-auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = knex(process.env.DATABASE_URL);

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const app = express();
const server = http.createServer(app);

const origin =
  process.env.NODE_ENV === 'production'
    ? 'https://sorrentobarbers.com'
    : 'http://localhost:8000';

const io = require('socket.io')(server, {
  handlePreflightRequest(req, res) {
    res.writeHead(200, {
      'Access-Control-Allow-Headers': 'Authorization',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': true
    });
    res.end();
  }
});

function getCustomers(organizationId) {
  return (
    db('customers')
      .select('customers.*', {agentName: 'users.name'})
      .leftJoin('users', 'users.id', '=', 'servedBy')
      .whereNull('servedAt')
      .andWhere({organizationId})
      // this works because the Sweden locale uses the ISO 8601 format
      .orWhere('servedAt', '>', new Date().toLocaleDateString('sv'))
  );
}

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
      await db('customers')
        .where(condition)
        .del();

      twiml.message(organization.removedMessage);

      const customers = await getCustomers(organization.id);
      io.to(organization.id).emit('data', {customers});
    } else {
      twiml.message(organization.notRemovedMessage);
    }
  } else {
    if (organization.accepting) {
      await db('customers').insert({
        name: req.body.Body,
        phone: req.body.From,
        organizationId: organization.id
      });

      const customers = await getCustomers(organization.id);
      const queue = customers.filter(customer => !customer.servedAt);

      // this value is calculated based on an EWT equation found here
      // https://developer.mypurecloud.com/api/rest/v2/routing/estimatedwaittime.html#methods_of_calculating_ewt
      const peopleAhead = queue.length - 1;
      const estimatedWaitTime = Math.round(
        (organization.averageHandleTime * peopleAhead) /
          organization.activeAgents
      );

      const message = expand(organization.welcomeMessage, {
        QUEUE_MESSAGE:
          queue.length > 1
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
      io.to(organization.id).emit('data', {customers});
    } else {
      twiml.message(organization.notAcceptingMessage);
    }
  }

  // send SMS reply
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

io.use(async (socket, next) => {
  try {
    const matches = socket.handshake.headers.authorization.match(
      /^bearer (\S+)$/i
    );

    const {sub} = jwt.verify(matches[1], process.env.JWT_SECRET);
    socket.user = await db('users')
      .where('id', sub)
      .first();

    if (!socket.user) {
      throw new Error('Invalid token');
    }

    return next();
  } catch (error) {
    return next(error);
  }
});

io.on('connection', async socket => {
  const {id: userId, organizationId} = socket.user;

  socket
    .join(organizationId, async () => {
      const customers = await getCustomers(organizationId);
      const [isAccepting] = await db('organizations')
        .where('id', organizationId)
        .pluck('accepting');

      // send initial state back to specific client on connection
      socket.emit('data', {
        customers,
        isAccepting
      });
    })
    .on('serve', async id => {
      const customer = await db('customers')
        .where({id})
        .first();
      // TODO: verify that customer is part of org/exists

      const organization = await db('organizations')
        .where('id', organizationId)
        .first();

      const message = await client.messages.create({
        body: organization.readyMessage,
        from: organization.phone,
        to: customer.phone
      });

      await db('customers')
        .where({id})
        .update({
          receipt: message.sid,
          servedAt: new Date(),
          servedBy: userId
        });

      const customers = await getCustomers(organizationId);
      io.to(organizationId).emit('data', {customers});
    })
    .on('remove', async id => {
      // TODO: verify that customer is part of org/exists
      await db('customers')
        .where({id})
        .del();

      const customers = await getCustomers(organizationId);
      io.to(organizationId).emit('data', {customers});
    })
    .on('accept', async accepting => {
      const [isAccepting] = await db('organizations')
        .where('id', organizationId)
        .update({accepting})
        .returning('accepting');
      io.to(organizationId).emit('data', {isAccepting});
    });
});

server.listen(process.env.PORT);
