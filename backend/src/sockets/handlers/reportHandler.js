import { SOCKET_EVENTS } from '../../constants/socketEvents.js';
import { matchService } from '../../services/matchService.js';
import { userService } from '../../services/userService.js';

export const registerReportHandlers = (io, socket) => {
  socket.on(SOCKET_EVENTS.REPORT_USER, async (data) => {
    console.log(`\n🛑 REPORT INITIATED for room: ${data.roomId}`);

    const room = io.sockets.adapter.rooms.get(data.roomId);
    if (!room) return;

    let partnerSocketId = null;
    for (const clientId of room) {
      if (clientId !== socket.id) partnerSocketId = clientId;
    }

    if (partnerSocketId) {
      const partnerEmail = matchService.getSocketEmail(partnerSocketId);
      if (!partnerEmail) return;

      try {
        const reportResult = await userService.processReport(partnerEmail);

        if (reportResult && reportResult.user) {
          const { user, newlyBlocked } = reportResult;
          console.log(`🚨 STRIKE ${user.reports}/3 for ${partnerEmail}. Reason: ${data.reason}`);

          if (newlyBlocked) {
            console.log(`🚫 BANNED: ${partnerEmail} is permanently blocked in Database!`);
            
            io.to(partnerSocketId).emit(SOCKET_EVENTS.YOU_ARE_BLOCKED);

            const partnerSocket = io.sockets.sockets.get(partnerSocketId);
            if (partnerSocket) partnerSocket.disconnect();
          }
        }
      } catch (error) {
        console.error("DB Error during report:", error);
      }
    }
  });
};
