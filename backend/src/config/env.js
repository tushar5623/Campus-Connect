import 'dotenv/config';

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  corsOrigins: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://campus-connect-murex.vercel.app",
    "http://localhost",
    "https://localhost",
    "capacitor://localhost"
  ]
};
