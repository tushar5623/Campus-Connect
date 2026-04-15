import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app); 

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], 
    methods: ["GET", "POST"],
  },
});

app.get('/', (req, res) => {
  res.send('Campus Connect API is running! 🚀');
}); 

let waitingUsers = []; 
const userEmails = {}; // Socket ID se Email map karne ke liye
const reportCounts = {}; // Kisko kitni report mili { 'test@college.edu': 2 }
const blockedEmails = new Set(); // Jo permanently block ho gaye (is session ke liye)

// 👇 NAYA FUNCTION: Sirf logged-in users ko count karne ke liye
const broadcastUserCount = () => {
  // Sirf un logo ko gino jo userEmails map me maujood hain
  const uniqueUsersCount = new Set(Object.values(userEmails)).size;
  
  io.emit('live_user_count', uniqueUsersCount);
};

io.on('connection', (socket) => {
  console.log(`🔌 New user connected: ${socket.id}`);

  // 👇 1. USER REGISTRATION (Email Link)
  socket.on('register_user', (email) => {
    if (blockedEmails.has(email)) {
      socket.emit('you_are_blocked');
      socket.disconnect(); // Blocked user ko turant bahar nikal do
      return;
    }
    userEmails[socket.id] = email;
    console.log(`👤 User registered: ${email} (${socket.id})`);
    
    // ✅ Jaise hi user register ho, sabko naya count batao
    broadcastUserCount();
  });

  // 👇 2. REPORT LOGIC (3 Strikes Rule)
  socket.on('report_user', (data) => {  
    console.log(`\n🛑 REPORT INITIATED for room: ${data.roomId}`);
    
    const room = io.sockets.adapter.rooms.get(data.roomId);
    if (!room) {
      console.log("⚠️ Room not found! (User clicked Next too fast)");
      return;
    }

    let partnerSocketId = null;
    for (const clientId of room) {
      if (clientId !== socket.id) partnerSocketId = clientId;
    }

    if (partnerSocketId) {
      const partnerEmail = userEmails[partnerSocketId];
      
      if (!partnerEmail) {
        console.log(`⚠️ ERROR: Backend doesn't know the email for socket ${partnerSocketId}`);
        return;
      }

      // Strike badhao
      reportCounts[partnerEmail] = (reportCounts[partnerEmail] || 0) + 1;
      console.log(`🚨 STRIKE ${reportCounts[partnerEmail]}/3 for ${partnerEmail}. Reason: ${data.reason}`);

      // 🛑 3 STRIKES = BAN HAMMER!
      if (reportCounts[partnerEmail] >= 3) {
        console.log(`🚫 BANNED: ${partnerEmail} is permanently blocked!`);
        blockedEmails.add(partnerEmail);
        
        // Partner ki screen ko LAAL karne ka signal bhejo
        io.to(partnerSocketId).emit('you_are_blocked');
        
        // Uska socket connection kaat do
        const partnerSocket = io.sockets.sockets.get(partnerSocketId);
        if (partnerSocket) partnerSocket.disconnect();
      }
    } else {
      console.log("⚠️ Partner socket ID not found in room.");
    }
  });

  // 👇 3. MATCHING LOGIC
  socket.on('find_match', () => {
    if (waitingUsers.length > 0) {
      const partner = waitingUsers.shift(); 
      if (partner.id === socket.id) return; 

      const roomId = `${partner.id}-${socket.id}`;
      socket.join(roomId);
      partner.join(roomId);

      io.to(roomId).emit('matched', { roomId, message: "You are now chatting with a random campus mate!" });
      console.log(`🎉 Match created! Room: ${roomId}`);
    } else {
      waitingUsers.push(socket);
      socket.emit('waiting', "Looking for a campus mate...");
    }
  });

  // 👇 4. CANCEL SEARCH
  socket.on('cancel_search', () => {
    console.log(`🛑 User cancelled search: ${socket.id}`);
    waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
  });

  // 👇 5. MESSAGE FORWARDING LOGIC
  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', {
      text: data.message,
      sender: 'stranger' 
    });
  });

  // 👇 6. TYPING INDICATOR LOGIC
  socket.on('typing', (roomId) => {
    socket.to(roomId).emit('stranger_typing');
  });

  socket.on('stop_typing', (roomId) => {
    socket.to(roomId).emit('stranger_stopped');
  });

  // 👇 7. LEAVE BUTTON CLICK LOGIC
  socket.on('leave_chat', (roomId) => {
    console.log(`🚪 User clicked leave for room: ${roomId}`);
    socket.to(roomId).emit('partner_left', "Stranger has disconnected 🚫");
    socket.leave(roomId);
  });

  // 👇 8. RAGE QUIT / TAB CLOSE LOGIC
  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit('partner_left', "Stranger left the chat (disconnected) 🚫");
      }
    }
  });

  // 👇 9. FINAL CLEANUP
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
    
    // ✅ NAYI LINE: User ko logged-in list se hata do
    delete userEmails[socket.id];
    
    // ✅ User chala gaya, ab bache hue logo ka count update karo
    broadcastUserCount(); 
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});