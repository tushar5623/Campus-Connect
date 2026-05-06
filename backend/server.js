import 'dotenv/config'; // 👈 Sirf ye ek line kaafi hai poore app ke liye!
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

// Tumhara link ab directly .env se aayega
const MONGO_URI = process.env.MONGO_URI; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ MongoDB Connection Error: ", err));


  // 👇 ------- USER SCHEMA (Rules & Data) ------- 👇
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // College Email
  name: { type: String, required: true }, // User ka naam
  reports: { type: Number, default: 0 }, // Kitni reports mili (Start 0 se hoga)
  isBlocked: { type: Boolean, default: false } // Block status
});

const User = mongoose.model('User', userSchema);
// 👆 ------------------------------------------ 👆
const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174","https://campus-connect-murex.vercel.app","http://localhost","https://localhost",  "capacitor://localhost"],
    methods: ["GET", "POST"],
    credentials: true
}))

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "https://campus-connect-murex.vercel.app","http://localhost","https://localhost",  "capacitor://localhost"], 
    methods: ["GET", "POST"],
  },
});

app.get('/', (req, res) => {
  res.send('Campus Connect API is running! 🚀');
}); 

let waitingUsers = []; 
const userEmails = {}; // Socket ID se Email map karne ke liye


// 👇 NAYA FUNCTION: Sirf logged-in users ko count karne ke liye
const broadcastUserCount = () => {
  // Sirf un logo ko gino jo userEmails map me maujood hain
  const uniqueUsersCount = new Set(Object.values(userEmails)).size;
  
  io.emit('live_user_count', uniqueUsersCount);
};

io.on('connection', (socket) => {
  console.log(`🔌 New user connected: ${socket.id}`);

  // 👇 1. USER REGISTRATION (Email Link)
 // 👇 1. USER REGISTRATION (Database Entry Gate)
  socket.on('register_user', async (email) => { // Dhyan do, yahan 'async' lagaya hai
    try {
      // Database mein check karo user pehle se hai ya nahi
      let dbUser = await User.findOne({ email: email });
      
      // Agar naya user hai toh use DB mein save karo
      if (!dbUser) {
        dbUser = new User({ email: email, name: email.split('@')[0] }); // Naam email se nikal liya
        await dbUser.save();
        console.log(`🆕 Naya User DB me Save Hua: ${email}`);
      }

      // Agar user DB mein BLOCKED hai, toh kick out karo
      console.log(`\n🕵️‍♂️ Jasusi Report for ${email}:`, dbUser);
      if (dbUser.isBlocked) {
        socket.emit('you_are_blocked');
        socket.disconnect(); // Turant bahar nikal do
        return; 
      }

      // Agar block nahi hai, toh andar aane do
      userEmails[socket.id] = email;
      console.log(`👤 User registered: ${email} (${socket.id})`);
      
      // Sabko naya count batao
      broadcastUserCount();

    } catch (error) {
      console.error("DB Error at Registration:", error);
    }
  });

  // 👇 2. REPORT LOGIC (3 Strikes Rule)
 // 👇 2. REPORT LOGIC (MongoDB 3 Strikes Rule)
  socket.on('report_user', async (data) => {  // Yahan bhi 'async' laga hai
    console.log(`\n🛑 REPORT INITIATED for room: ${data.roomId}`);
    
    const room = io.sockets.adapter.rooms.get(data.roomId);
    if (!room) return;

    let partnerSocketId = null;
    for (const clientId of room) {
      if (clientId !== socket.id) partnerSocketId = clientId;
    }

    if (partnerSocketId) {
      const partnerEmail = userEmails[partnerSocketId];
      if (!partnerEmail) return;

      try {
        // Database se us bad-user ko dhoondo
        let badUser = await User.findOne({ email: partnerEmail });
        
        if (badUser && !badUser.isBlocked) {
          badUser.reports += 1; // DB me strike badhao
          console.log(`🚨 STRIKE ${badUser.reports}/3 for ${partnerEmail}. Reason: ${data.reason}`);

          // 🛑 3 STRIKES = PERMANENT BAN IN DATABASE!
          if (badUser.reports >= 3) {
            badUser.isBlocked = true;
            console.log(`🚫 BANNED: ${partnerEmail} is permanently blocked in Database!`);
            
            // Partner ki screen ko LAAL karne ka signal bhejo
            io.to(partnerSocketId).emit('you_are_blocked');
            
            // Uska socket connection kaat do
            const partnerSocket = io.sockets.sockets.get(partnerSocketId);
            if (partnerSocket) partnerSocket.disconnect();
          }

          // Changes Database me save kar do
          await badUser.save();
        }
      } catch (error) {
        console.error("DB Error during report:", error);
      }
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