import { SOCKET_EVENTS } from '../../constants/socketEvents.js';
import { SYSTEM_MESSAGES } from '../../constants/messages.js';
import { matchService } from '../../services/matchService.js';

export const registerMatchHandlers = (io, socket) => {
  // Text Match
  socket.on(SOCKET_EVENTS.FIND_MATCH, () => {
    const result = matchService.findTextMatch(socket);

    if (result) {
      const { roomId } = result;
      io.to(roomId).emit(SOCKET_EVENTS.MATCHED, {
        roomId,
        message: SYSTEM_MESSAGES.MATCHED_TEXT
      });
      console.log(`🎉 Match created! Room: ${roomId}`);
    } else {
      socket.emit(SOCKET_EVENTS.WAITING, SYSTEM_MESSAGES.WAITING_TEXT);
    }
  });

  // Cancel Search
  socket.on(SOCKET_EVENTS.CANCEL_SEARCH, () => {
    console.log(`🛑 User cancelled search: ${socket.id}`);
    matchService.removeUserFromQueues(socket.id);
  });

  // Video Match
  socket.on(SOCKET_EVENTS.FIND_VIDEO_MATCH, () => {
    const result = matchService.findVideoMatch(socket);

    if (result) {
      const { partner, roomId } = result;

      partner.emit(SOCKET_EVENTS.VIDEO_MATCHED, {
        roomId,
        initiator: true,
        message: SYSTEM_MESSAGES.MATCHED_VIDEO
      });
      socket.emit(SOCKET_EVENTS.VIDEO_MATCHED, {
        roomId,
        initiator: false,
        message: SYSTEM_MESSAGES.MATCHED_VIDEO
      });

      console.log(`📹 Video match created! Room: ${roomId}`);
    } else {
      socket.emit(SOCKET_EVENTS.VIDEO_WAITING, SYSTEM_MESSAGES.WAITING_VIDEO);
    }
  });
};
