import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";
const TOTAL_BOTS = 51; // Abhi 50 bots se start karte hain

console.log(`\n🤖 PREPARING BOT ARMY... Target: ${SERVER_URL}`);
console.log(`⚠️ Deploying ${TOTAL_BOTS} bots in 3... 2... 1...\n`);

for (let i = 1; i <= TOTAL_BOTS; i++) {
  // Har bot ko connect hone me 100ms ka gap dete hain taaki ekdum se crash na ho
  setTimeout(() => {
    const socket = io(SERVER_URL);
    const botEmail = `bot_soldier_${i}@loadtest.com`;

    socket.on("connect", () => {
      console.log(`🟢 Bot ${i} Connected! (${socket.id})`);
      
      // 1. Bot ko Register karo
      socket.emit("register_user", botEmail);
      
      // 2. Turant Match find karne bhejo
      socket.emit("find_match");
    });

    socket.on("matched", (data) => {
      console.log(`⚔️ Bot ${i} locked target! Room: ${data.roomId}`);
      
      let msgCount = 1;
      // Interval ko ek variable me save karo taaki baad me rok sakein
      const spamInterval = setInterval(() => {
        socket.emit("send_message", {
          roomId: data.roomId,
          message: `[Bot ${i}]: Initiating load test sequence... Message #${msgCount}`
        });
        
        socket.emit("typing", data.roomId);
        setTimeout(() => socket.emit("stop_typing", data.roomId), 1000);
        
        msgCount++;
      }, 2000); 

      // 👇 NAYA LOGIC: Jab partner "Next" daba kar chala jaye
      socket.on("partner_left", () => {
        console.log(`💔 Bot ${i}'s partner left. Stopping spam and searching again...`);
        clearInterval(spamInterval); // Purane room me spam rok do
        socket.emit("find_match"); // Wapas line me lag jao!
      });
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Bot ${i} went offline.`);
    });

  }, i * 100); // Staggered deployment (Bot 1 at 100ms, Bot 2 at 200ms, etc.)
}