import { Server, Socket } from 'socket.io';
import http from 'http';
import CustomError from '../helpers/CustomError';

let io: Server | null = null;

// Track connected socket roles: socketId -> { userId, role }
const connectedUsers = new Map<string, { userId: string; role: string }>();


interface JoinChatPayload {
  chatId: string;
}

export const initSocket = (httpServer: http.Server): Server => {
  if (io) return io;

  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket: Socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // Personal room
    const userId = socket.handshake.query?.userId as string | undefined;
    const userRole = (socket.handshake.query?.role as string | undefined) || 'rider';
    
    if (userId) {
      socket.join(userId);
      connectedUsers.set(socket.id, { userId, role: userRole });
      console.log(`👤 User joined personal room: ${userId} (${userRole})`);
    }

    // Join chat
    socket.on('joinChat', ({ chatId }: JoinChatPayload) => {
      if (!chatId) return;
      socket.join(chatId);
      console.log(`💬 Joined chat room: ${chatId}`);
    });

    // Leave chat
    socket.on('leaveChat', ({ chatId }: JoinChatPayload) => {
      if (!chatId) return;
      socket.leave(chatId);
      console.log(`🚪 Left chat room: ${chatId}`);
    });

    // Real-time user location update
    socket.on('update_location', (data: { userId: string; name?: string; role?: string; lat: number; lng: number }) => {
      if (!data.userId || !Number.isFinite(data.lat) || !Number.isFinite(data.lng)) return;

      const senderRole = data.role || connectedUsers.get(socket.id)?.role || 'rider';

      // 🔒 PRIVACY RULE 1: Admin location is NEVER broadcast to anyone
      if (senderRole === 'admin') return;

      // 🎯 PRIVACY RULE 2: Rider location is sent ONLY to admin sockets
      connectedUsers.forEach(({ role }, adminSocketId) => {
        if (role === 'admin' && adminSocketId !== socket.id) {
          io!.to(adminSocketId).emit('user_location_changed', {
            userId: data.userId,
            name: data.name || 'Rider',
            lat: data.lat,
            lng: data.lng,
          });
        }
      });
    });

    // // Typing
    // socket.on('typing', ({ chatId, userId }: TypingPayload) => {
    //   if (!chatId || !userId) return;
    //   socket.broadcast.to(chatId).emit('typing', { userId });
    // });

    // socket.on('stopTyping', ({ chatId, userId }: TypingPayload) => {
    //   if (!chatId || !userId) return;
    //   socket.broadcast.to(chatId).emit('stopTyping', { userId });
    // });

    // // New message
    // socket.on('newMessage', ({ chatId, userId, content }: MessagePayload) => {
    //   if (!chatId || !userId || !content) return;

    //   console.log(
    //     `📩 New message from ${userId} in chat ${chatId}: ${content}`,
    //   );

    //   // Broadcast to room
    //   socket.to(chatId).emit('newMessage', {
    //     chatId,
    //     userId,
    //     content,
    //     timestamp: new Date().toISOString(),
    //   });
    // });

    // Disconnect
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  return io;
};

export const getIo = (): Server => {
  if (!io) throw new CustomError(500, 'Socket not initialized');
  return io;
};
