const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from anywhere (Gateway/Frontend)
    methods: ["GET", "POST"]
  }
});

// Store chat history in memory (for this demo)
// In production, save this to MongoDB!
let chatHistory = [];

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. User Joins a Room (e.g., "Trip to Bali")
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    
    // Send history to the user who just joined
    const roomHistory = chatHistory.filter(msg => msg.room === room);
    socket.emit('load_history', roomHistory);
  });

  // 2. User Sends a Message
  socket.on('send_message', (data) => {
    // data = { room, author, message, time }
    const messageData = { ...data, id: Date.now() };
    
    // Save to memory
    chatHistory.push(messageData);
    
    // Broadcast to everyone ELSE in that room
    socket.to(data.room).emit('receive_message', messageData);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5006;
server.listen(PORT, () => console.log(`Chat Service running on port ${PORT}`));