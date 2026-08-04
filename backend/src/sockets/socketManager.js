import { SOCKET_EVENTS } from '../constants/socketEvents.js';
import { SYSTEM_MESSAGES } from '../constants/messages.js';
import { matchService } from '../services/matchService.js';
import { registerAuthHandlers } from './handlers/authHandler.js';
import { registerMatchHandlers } from './handlers/matchHandler.js';
import { registerChatHandlers } from './handlers/chatHandler.js';
import { registerVideoHandlers } from './handlers/videoHandler.js';
import { registerReportHandlers } from './handlers/reportHandler.js';

export const initializeSocketIO = (io) => {
  const broadcastUserCount = () => {
    const count = matchService.getUniqueOnlineCount();
    io.emit(SOCKET_EVENTS.LIVE_USER_COUNT, count);
  };

  io.on('connection', (socket) => {
    console.log(`🔌 New user connected: ${socket.id}`);

    // Register all modular handlers
    registerAuthHandlers(io, socket, broadcastUserCount);
    registerMatchHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerVideoHandlers(io, socket);
    registerReportHandlers(io, socket);

    // Disconnecting (Tab closing/rage quit)
    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit(SOCKET_EVENTS.PARTNER_LEFT, SYSTEM_MESSAGES.PARTNER_LEFT_RAGE);
        }
      }
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      matchService.removeUserFromQueues(socket.id);
      matchService.removeSocketEmail(socket.id);
      broadcastUserCount();
    });
  });
};
