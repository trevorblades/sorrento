const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {MessagingResponse} = require('twilio').twiml;
const bodyParser = require('body-parser');
const knex = require('knex');

server.listen(process.env.PORT);

const AVG_HAIRCUT_DURATION = 40;

const db = knex({
  client: 'pg',
  connection: 'postgres://localhost/sorrento'
});

app.use(bodyParser.urlencoded({extended: false}));

app.post('/sms', async (req, res) => {
  const twiml = new MessagingResponse();

  await db('customers').insert({
    name: req.body.Body,
    phone: req.body.From
  });

  const customers = await db('customers');
  const peopleAhead = customers.length - 1;
  // TODO: factor in # of barbers to avg haircut duration

  twiml.message(
    `Hello!  You are on the list.  There are ${peopleAhead} people ahead of you.  The approximate wait time is ${peopleAhead *
      AVG_HAIRCUT_DURATION} minutes.  We will text you when you're up next.`
  );

  // broadcast the new list to socket.io clients
  io.emit('data', {customers});

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

io.on('connection', async socket => {
  socket.on('serve', async data => {
    await db('customers')
      .where('id', data.id)
      .update('waiting', false);
    const customers = await db('customers');
    io.emit('data', {customers});
  });

  const customers = await db('customers');
  socket.emit('data', {customers});
});
