const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const twilio = require('twilio');
const bodyParser = require('body-parser');
const knex = require('knex');

const AVG_HAIRCUT_DURATION = 40;

const db = knex({
  client: 'pg',
  connection: 'postgres://localhost/sorrento'
});

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.use(bodyParser.urlencoded({extended: false}));

app.post('/sms', async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  await db('customers').insert({
    name: req.body.Body,
    phone: req.body.From
  });

  const customers = await db('customers');
  const peopleAhead = customers.length - 1;
  // TODO: factor in # of barbers to avg haircut duration
  const waitTime = peopleAhead * AVG_HAIRCUT_DURATION;

  twiml.message(
    `Hello!  You are on the list.  There are ${peopleAhead} people ahead of you.  The approximate wait time is ${waitTime} minutes.  We will text you when you're up next.`
  );

  // broadcast the new list to socket.io clients
  io.emit('data', {customers});

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

  const customers = await db('customers');
  socket.emit('data', {customers});
});

server.listen(process.env.PORT);
