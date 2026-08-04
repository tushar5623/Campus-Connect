import { SOCKET_EVENTS } from '../../constants/socketEvents.js';
import { SYSTEM_MESSAGES } from '../../constants/messages.js';

export const registerChatHandlers = (io, socket) => {
  // Send Message
  socket.on(SOCKET_EVENTS.SEND_MESSAGE, (data) => {
    socket.to(data.roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, {
      text: data.message,
      sender: 'stranger'
    });
  });

  // Typing
  socket.on(SOCKET_EVENTS.TYPING, (roomId) => {
    socket.to(roomId).emit(SOCKET_EVENTS.STRANGER_TYPING);
  });

  // Stop Typing
  socket.on(SOCKET_EVENTS.STOP_TYPING, (roomId) => {
    socket.to(roomId).emit(SOCKET_EVENTS.STRANGER_STOPPED);
  });

  // Leave Chat
  socket.on(SOCKET_EVENTS.LEAVE_CHAT, (roomId) => {
    console.log(`🚪 User clicked leave for room: ${roomId}`);
    socket.to(roomId).emit(SOCKET_EVENTS.PARTNER_LEFT, SYSTEM_MESSAGES.PARTNER_DISCONNECTED);
    socket.leave(roomId);
  });
};
