import { io } from "socket.io-client";

// --- CONFIGURATION ---
const SERVER_URL = "https://api-campusconnect.me"; // Tera AWS Public IP
const TOTAL_BOTS = 51;

console.log(`🤖 PREPARING BOT ARMY... Target: ${SERVER_URL}`);
console.log(`⚠️ Deploying ${TOTAL_BOTS} bots in 3... 2... 1...`);

for (let i = 1; i <= TOTAL_BOTS; i++) {
  setTimeout(() => {
    const socket = io(SERVER_URL, {
      transports: ["websocket"], // Fast connection ke liye
    });

    let spamInterval = null; // Har bot ka apna private timer

    socket.on("connect", () => {
      console.log(`🟢 Bot ${i} Connected! (${socket.id})`);
      socket.emit("register_user", `bot${i}@gmail.com`);
      socket.emit("find_match");
    });

    socket.on("matched", (data) => {
      console.log(`⚔️ Bot ${i} matched! Room: ${data.roomId}`);

      // 1. Purane kachre ki safai
      if (spamInterval) clearInterval(spamInterval);
      socket.off("partner_left");

      // 2. Partner ke jaane ka listener
      socket.on("partner_left", () => {
        console.log(`💔 Bot ${i}'s partner left. Searching again...`);
        if (spamInterval) clearInterval(spamInterval);
        socket.emit("find_match");
      });

      // 3. Spamming shuru (3 seconds gap)
      spamInterval = setInterval(() => {
        socket.emit("send_message", {
          roomId: data.roomId,
          message: "Campus Connect AWS Test: Bot Army is active! 🚀",
        });
      }, 3000);
    });

    socket.on("disconnect", () => {
      if (spamInterval) clearInterval(spamInterval);
      console.log(`🔴 Bot ${i} Disconnected.`);
    });

  }, i * 200); // Har bot ke beech 200ms ka gap taaki AWS chillaye nahi
}