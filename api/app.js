const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const twilio = require('twilio');
const knex = require('knex');

const AVERAGE_HANDLE_TIME = 40;
const ACTIVE_AGENTS = 3;

const db = knex({
  client: 'pg',
  connection: 'postgres://localhost/sorrento'
});

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.urlencoded({extended: false}));

app.post('/sms', async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const accept = await db('settings')
    .where('key', 'accept')
    .first();

  if (accept.value) {
    await db('customers').insert({
      name: req.body.Body,
      phone: req.body.From
    });

    // this value is calculated based on an EWT equation found here
    // https://developer.mypurecloud.com/api/rest/v2/routing/estimatedwaittime.html#methods_of_calculating_ewt
    const customers = await db('customers');
    const queue = customers.filter(customer => !customer.servedAt);
    const positionInQueue = queue.length + 1;
    const estimatedWaitTime =
      (AVERAGE_HANDLE_TIME * positionInQueue) / ACTIVE_AGENTS;

    // TODO: convert this into hours and minutes
    // TODO: add current time + estimated wait time (4:30pm)
    twiml.message(
      `Hello!  You are on the list.  There are ${
        queue.length
      } people ahead of you.  The approximate wait time is ${Math.round(
        estimatedWaitTime
      )} minutes.  We will text you when you're up next.`
    );

    // broadcast the new list to socket.io clients
    io.emit('data', {customers});
  } else {
    twiml.message(
      "We have stopped accepting customers for today. Please come back tomorrow. We're open starting at 8am PT."
    );
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

io.on('connection', async socket => {
  socket.on('serve', async data => {
    const customer = await db('customers')
      .where('id', data.id)
      .first();

    const message = await client.messages.create({
      body:
        'Your barber is ready to serve you!  Please head over to Sorrento to meet your barber',
      from: '+16043308137',
      to: customer.phone
    });

    await db('customers')
      .where('id', data.id)
      .update({
        receipt: message.sid,
        servedAt: new Date()
      });

    const customers = await db('customers');
    io.emit('data', {customers});
  });

  socket.on('remove', async data => {
    await db('customers')
      .where('id', data.id)
      .del();

    const customers = await db('customers');
    io.emit('data', {customers});
  });

  socket.on('accept', async data => {
    const [isAccepting] = await db('settings')
      .where('key', 'accept')
      .update('value', data.value)
      .returning('value');
    io.emit('data', {isAccepting});
  });

  const customers = await db('customers');
  const accept = await db('settings')
    .where('key', 'accept')
    .first();
  socket.emit('data', {
    customers,
    isAccepting: accept.value
  });
});

server.listen(process.env.PORT);
