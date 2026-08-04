import { SOCKET_EVENTS } from '../../constants/socketEvents.js';
import { userService } from '../../services/userService.js';
import { matchService } from '../../services/matchService.js';

export const registerAuthHandlers = (io, socket, broadcastUserCount) => {
  socket.on(SOCKET_EVENTS.REGISTER_USER, async (email) => {
    try {
      const user = await userService.registerOrFetchUser(email);

      console.log(`\n🕵️‍♂️ Jasusi Report for ${email}:`, user);
      if (user.isBlocked) {
        socket.emit(SOCKET_EVENTS.YOU_ARE_BLOCKED);
        socket.disconnect();
        return;
      }

      matchService.registerSocketEmail(socket.id, email);
      console.log(`👤 User registered: ${email} (${socket.id})`);

      broadcastUserCount();
    } catch (error) {
      console.error("DB Error at Registration:", error);
    }
  });
};
