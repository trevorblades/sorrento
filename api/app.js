const io = require('socket.io')(process.env.PORT);
const redis = require('redis');
const client = redis.createClient();

io.on('connection', socket => {
  client.lrange(['test', 0, -1], function(err, res) {
    socket.emit('data', {customers: res});
  });

  socket.on('name', data => {
    client.rpush(['test', data.name], function() {
      client.lrange(['test', 0, -1], function(err, res) {
        io.emit('data', {customers: res});
      });
    });
  });
});
