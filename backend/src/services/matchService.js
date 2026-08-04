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
    if (this.waitingUsers.length > 0) {
      const partner = this.waitingUsers.shift();
      if (partner.id === socket.id) return null;

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
    this.waitingUsers = this.waitingUsers.filter(user => user.id !== socket.id);

    if (this.waitingVideoUsers.length > 0) {
      const partner = this.waitingVideoUsers.shift();
      if (partner.id === socket.id) return null;

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
