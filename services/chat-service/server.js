const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'chat-service' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

let chatHistory = [];

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    
    
    const roomHistory = chatHistory.filter(msg => msg.room === room);
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

const CHAT_PORT = Number(process.env.CHAT_PORT) || 5006;
server.listen(CHAT_PORT, () => console.log(`Chat Service running on port ${CHAT_PORT}`));