const io = require('socket.io')(4000);

const customers = ['Customer B', 'Customer C', 'Customer D'];

io.on('connection', socket => {
  socket.emit('data', {customers});
  socket.on('name', data => {
    customers.push(data.name);
    io.emit('data', {customers});
  });
});
