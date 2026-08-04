import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  reports: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false }
});

export const User = mongoose.model('User', userSchema);
