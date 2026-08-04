import { User } from '../models/User.js';

export const userRepository = {
  async findByEmail(email) {
    return await User.findOne({ email });
  },

  async createUser(email, name) {
    const user = new User({ email, name });
    return await user.save();
  },

  async incrementReportAndCheckBlock(email, maxReportsThreshold = 3) {
    const user = await User.findOne({ email });
    if (!user || user.isBlocked) {
      return { user, newlyBlocked: false };
    }

    user.reports += 1;
    let newlyBlocked = false;

    if (user.reports >= maxReportsThreshold) {
      user.isBlocked = true;
      newlyBlocked = true;
    }

    await user.save();
    return { user, newlyBlocked };
  }
};
