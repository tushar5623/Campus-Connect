import http from 'http';
import { Server } from 'socket.io';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';
import { initializeSocketIO } from './sockets/socketManager.js';

export const startServer = async () => {
  // 1. Connect Database
  await connectDatabase();

  // 2. Initialize Express app
  const app = createApp();

  // 3. Create HTTP & Socket.IO Servers
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigins,
      methods: ["GET", "POST"],
    },
  });

  // 4. Initialize Socket.IO Handlers
  initializeSocketIO(io);

  // 5. Start Listening
  server.listen(config.port, () => {
    console.log(`✅ Server is running on http://localhost:${config.port}`);
  });
};

startServer();
