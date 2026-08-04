import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';

export const createApp = () => {
  const app = express();

  // CORS middleware setup
  app.use(cors({
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }));

  // Body parser
  app.use(express.json());

  // Mount HTTP Routes
  app.use('/', healthRoutes);

  return app;
};
