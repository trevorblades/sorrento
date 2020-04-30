const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const redis = require('redis');
const {MessagingResponse} = require('twilio').twiml;
const bodyParser = require('body-parser');

server.listen(process.env.PORT);

const LIST_NAME = 'test';
const AVG_HAIRCUT_DURATION = 40;
const client = redis.createClient();

function displayList() {
  client.lrange([LIST_NAME, 0, -1], (err, res) => {
    io.emit('data', {customers: res});
  });
}

app.use(bodyParser.urlencoded({extended: false}));

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  client.rpush([LIST_NAME, req.body.Body], (err, count) => {
    const peopleAhead = count - 1;
    // TODO: factor in # of barbers to avg haircut duration
    twiml.message(
      `Hello!  You are on the list.  There are ${peopleAhead} people ahead of you.  The approximate wait time is ${peopleAhead *
        AVG_HAIRCUT_DURATION} minutes.  We will text you when you're up next.`
    );

    // broadcast the new list to socket.io clients
    displayList();

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  });
});

io.on('connection', socket => {
  client.lrange([LIST_NAME, 0, -1], (err, res) => {
    socket.emit('data', {customers: res});
  });

  socket.on('next', () => {
    client.lpop(LIST_NAME, displayList);
  });
});
