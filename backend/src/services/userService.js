import { userRepository } from '../repositories/userRepository.js';

export const userService = {
  async registerOrFetchUser(email) {
    let user = await userRepository.findByEmail(email);

    if (!user) {
      const name = email.split('@')[0];
      user = await userRepository.createUser(email, name);
      console.log(`🆕 Naya User DB me Save Hua: ${email}`);
    }

    return user;
  },

  async processReport(partnerEmail) {
    if (!partnerEmail) return null;
    const result = await userRepository.incrementReportAndCheckBlock(partnerEmail, 3);
    return result;
  }
};
