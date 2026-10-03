import cookieParser from 'cookie-parser';
import express from 'express';
import { corsMiddleware } from './config/cors.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';

/** Express app factory. Middleware order matters — error handler must be last. */
export const createApp = () => {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(cookieParser());

  // Dev convenience only — not part of the versioned API
  app.get('/', (_req, res) => {
    res.type('text').send('Server is running');
  });

  app.use('/api/v1', apiRouter);
  app.use(errorMiddleware);

  return app;
};
