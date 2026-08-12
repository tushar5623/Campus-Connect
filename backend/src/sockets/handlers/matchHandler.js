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
    console.log(`\n📹 [VIDEO] find_video_match received from: ${socket.id}`);
    console.log(`📹 [VIDEO] Video queue BEFORE match: [${matchService.waitingVideoUsers.map(u => u.id).join(', ')}]`);

    const result = matchService.findVideoMatch(socket);

    console.log(`📹 [VIDEO] Video queue AFTER match: [${matchService.waitingVideoUsers.map(u => u.id).join(', ')}]`);

    if (result) {
      const { partner, roomId } = result;
      console.log(`📹 [VIDEO] ✅ Match found! Room: ${roomId} | Partner: ${partner.id}`);

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

      console.log(`📹 [VIDEO] video_matched emitted to both parties.`);
    } else {
      console.log(`📹 [VIDEO] No match yet. Sending video_waiting to ${socket.id}.`);
      socket.emit(SOCKET_EVENTS.VIDEO_WAITING, SYSTEM_MESSAGES.WAITING_VIDEO);
    }
  });
};
