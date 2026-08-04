import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDatabase = async () => {
  try {
    if (!config.mongoUri) {
      throw new Error("MONGO_URI is missing from environment variables!");
    }
    await mongoose.connect(config.mongoUri);
    console.log("🔥 MongoDB Connected Successfully!");
  } catch (err) {
    console.error("❌ MongoDB Connection Error: ", err);
    process.exit(1);
  }
};
