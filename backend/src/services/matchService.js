class MatchService {
  constructor() {
    this.waitingUsers = [];
    this.waitingVideoUsers = [];
    this.userEmails = {}; // socket.id -> email mapping
  }

  // Socket <-> Email mapping
  registerSocketEmail(socketId, email) {
    this.userEmails[socketId] = email;
  }

  getSocketEmail(socketId) {
    return this.userEmails[socketId];
  }

  removeSocketEmail(socketId) {
    delete this.userEmails[socketId];
  }

  getUniqueOnlineCount() {
    return new Set(Object.values(this.userEmails)).size;
  }

  // Queue cleanup
  removeUserFromQueues(socketId) {
    this.waitingUsers = this.waitingUsers.filter(user => user.id !== socketId);
    this.waitingVideoUsers = this.waitingVideoUsers.filter(user => user.id !== socketId);
  }

  // Text matchmaking
  findTextMatch(socket) {
    // Remove self from video queue too, in case of mode switch
    this.waitingVideoUsers = this.waitingVideoUsers.filter(user => user.id !== socket.id);
    this.waitingUsers = this.waitingUsers.filter(user => user.id !== socket.id);

    let partner = null;
    while (this.waitingUsers.length > 0) {
      const candidate = this.waitingUsers.shift();
      if (candidate.id === socket.id) continue;
      if (!candidate.connected) {
        console.log(`🧹 Removed stale socket from text queue: ${candidate.id}`);
        continue;
      }
      partner = candidate;
      break;
    }

    if (partner) {
      const roomId = `${partner.id}-${socket.id}`;
      socket.join(roomId);
      partner.join(roomId);
      return { partner, roomId };
    } else {
      this.waitingUsers.push(socket);
      return null;
    }
  }

  // Video matchmaking
  findVideoMatch(socket) {
    // Remove this socket from BOTH queues first (prevents ghost/duplicate entries
    // when a user clicks 'Next' or re-searches without a full disconnect)
    this.waitingUsers = this.waitingUsers.filter(user => user.id !== socket.id);
    this.waitingVideoUsers = this.waitingVideoUsers.filter(user => user.id !== socket.id);

    // Skip any stale/disconnected sockets at the front of the queue
    let partner = null;
    while (this.waitingVideoUsers.length > 0) {
      const candidate = this.waitingVideoUsers.shift();
      // Skip self-match and disconnected sockets
      if (candidate.id === socket.id) continue;
      if (!candidate.connected) {
        console.log(`🧹 Removed stale socket from video queue: ${candidate.id}`);
        continue;
      }
      partner = candidate;
      break;
    }

    if (partner) {
      const roomId = `video-${partner.id}-${socket.id}`;
      socket.join(roomId);
      partner.join(roomId);
      return { partner, roomId };
    } else {
      this.waitingVideoUsers.push(socket);
      return null;
    }
  }
}

export const matchService = new MatchService();
