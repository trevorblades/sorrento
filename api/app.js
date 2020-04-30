const io = require('socket.io')(process.env.PORT);
const redis = require('redis');
const client = redis.createClient();

const LIST_NAME = 'test';

function displayList() {
  client.lrange([LIST_NAME, 0, -1], (err, res) => {
    io.emit('data', {customers: res});
  });
}

io.on('connection', socket => {
  client.lrange([LIST_NAME, 0, -1], (err, res) => {
    socket.emit('data', {customers: res});
  });

  socket.on('name', data => {
    client.rpush([LIST_NAME, data.name], displayList);
  });

  socket.on('next', () => {
    client.lpop(LIST_NAME, displayList);
  });
});
