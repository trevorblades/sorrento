const express = require('express');
const http = require('http');
const twilio = require('twilio');
const knex = require('knex');
const cors = require('cors');
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

function getCustomers() {
  return (
    db('customers')
      .select('customers.*', {barberName: 'barbers.name'})
      .leftJoin('barbers', 'barbers.id', '=', 'servedBy')
      // this works because the Sweden locale uses the ISO 8601 format
      .where('servedAt', '>', new Date().toLocaleDateString('sv'))
      .orWhereNull('servedAt')
  );
}

app.use(cors({origin}));
app.use(express.urlencoded({extended: false}));

app.get('/auth', async (req, res) => {
  const credentials = basicAuth(req);

  try {
    const user = await db('barbers')
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
  const REMOVE_KEYWORD = 'REMOVE';
  const QUEUE_LIMIT = 20;

  const twiml = new twilio.twiml.MessagingResponse();

  if (req.body.Body.trim().toUpperCase() === REMOVE_KEYWORD) {
    const condition = {
      servedAt: null,
      phone: req.body.From
    };

    const matches = await db('customers').where(condition);

    if (matches.length) {
      await db('customers')
        .where(condition)
        .del();

      twiml.message('You have been removed from the list.');

      const customers = await getCustomers();
      io.emit('data', {customers});
    } else {
      twiml.message('You are not on the list.');
    }
  } else {
    const accept = await db('settings')
      .where('key', 'accept')
      .first();

    if (accept.value) {
      const {count: peopleAhead} = await db('customers')
        .count('id')
        .whereNull('servedAt')
        .first();

      if (peopleAhead < QUEUE_LIMIT) {
        await db('customers').insert({
          name: req.body.Body,
          phone: req.body.From
        });

        const messages = ['Hello! You are on the list.'];
        if (peopleAhead > 0) {
          const AVERAGE_HANDLE_TIME = 40;
          const ACTIVE_AGENTS = 3;

          // this value is calculated based on an EWT equation found here
          // https://developer.mypurecloud.com/api/rest/v2/routing/estimatedwaittime.html#methods_of_calculating_ewt
          const estimatedWaitTime = Math.round(
            (AVERAGE_HANDLE_TIME * peopleAhead) / ACTIVE_AGENTS
          );

          messages.push(
            `There ${
              peopleAhead === 1 ? 'is 1 person' : `are ${peopleAhead} people`
            } ahead of you. The approximate wait time is ${estimatedWaitTime} minutes.`
          );
        } else {
          messages.push('There is nobody ahead of you.');
        }

        messages.push(
          `We will text you when you're up next. Reply "${REMOVE_KEYWORD}" at any time to remove yourself from the list. This is an automated response, so we can not reply to your questions.`
        );

        twiml.message(messages.join(' '));

        // broadcast new customer list to all connected clients
        const customers = await getCustomers();
        io.emit('data', {customers});
      } else {
        twiml.message('The list is currently full. Please try again later.');
      }
    } else {
      twiml.message(
        'We have stopped accepting customers for today. Visit https://sorrentobarbers.com for our store hours.'
      );
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
    socket.user = await db('barbers')
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
  socket.on('serve', async data => {
    const customer = await db('customers')
      .where('id', data.id)
      .first();

    const message = await client.messages.create({
      body:
        'Your barber is ready to serve you! Please head over to Sorrento to meet your barber.',
      from: '+16043308137',
      to: customer.phone
    });

    await db('customers')
      .where('id', data.id)
      .update({
        receipt: message.sid,
        servedAt: new Date(),
        servedBy: socket.user.id
      });

    const customers = await getCustomers();
    io.emit('data', {customers});
  });

  socket.on('remove', async data => {
    await db('customers')
      .where('id', data.id)
      .del();

    const customers = await getCustomers();
    io.emit('data', {customers});
  });

  socket.on('accept', async data => {
    const [isAccepting] = await db('settings')
      .where('key', 'accept')
      .update('value', data.value)
      .returning('value');
    io.emit('data', {isAccepting});
  });

  const customers = await getCustomers();
  const accept = await db('settings')
    .where('key', 'accept')
    .first();

  // send initial state back to specific client on connection
  socket.emit('data', {
    customers,
    isAccepting: accept.value
  });
});

server.listen(process.env.PORT);
