const { Server } = require('socket.io');

const initChat = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const chatHistory = [];

  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);

      const roomHistory = chatHistory.filter((msg) => msg.room === room);
      socket.emit('load_history', roomHistory);
    });

    socket.on('send_message', (data) => {
      const messageData = { ...data, id: Date.now() };
      chatHistory.push(messageData);
      socket.to(data.room).emit('receive_message', messageData);
    });

    socket.on('disconnect', () => {
      console.log('User Disconnected', socket.id);
    });
  });

  return io;
};

module.exports = { initChat };
