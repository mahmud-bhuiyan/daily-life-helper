import cookieParser from 'cookie-parser';
import express from 'express';
import { corsMiddleware } from './config/cors.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';

export const createApp = () => {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/v1', apiRouter);
  app.use(errorMiddleware);

  return app;
};
