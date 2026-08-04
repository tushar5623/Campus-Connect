import { SYSTEM_MESSAGES } from '../constants/messages.js';

export const healthController = {
  getHealth(req, res) {
    res.send(SYSTEM_MESSAGES.HEALTH_OK);
  }
};
