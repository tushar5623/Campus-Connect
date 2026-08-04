import { SOCKET_EVENTS } from '../../constants/socketEvents.js';

export const registerVideoHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.VIDEO_OFFER, ({ roomId, offer }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.VIDEO_OFFER, { offer });
  });

  socket.on(SOCKET_EVENTS.VIDEO_ANSWER, ({ roomId, answer }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.VIDEO_ANSWER, { answer });
  });

  socket.on(SOCKET_EVENTS.VIDEO_ICE_CANDIDATE, ({ roomId, candidate }) => {
    socket.to(roomId).emit(SOCKET_EVENTS.VIDEO_ICE_CANDIDATE, { candidate });
  });
};
