import { Server } from 'socket.io';

export function registerChatSocket(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join_room', (matchId: string) => {
      socket.join(matchId);
    });

    socket.on('send_message', (payload: { matchId: string; senderId: string; body: string }) => {
      io.to(payload.matchId).emit('receive_message', {
        ...payload,
        createdAt: new Date().toISOString()
      });
    });

    socket.on('typing', (payload: { matchId: string; userId: string; isTyping: boolean }) => {
      socket.to(payload.matchId).emit('typing', payload);
    });
  });
}
