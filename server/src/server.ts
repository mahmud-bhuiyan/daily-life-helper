import cookieParser from 'cookie-parser';
import express from 'express';
import { corsMiddleware } from './config/cors.js';
import { env } from './config/env.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';

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

// Local dev only — Vercel imports the default export as a serverless function.
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Health: http://localhost:${env.PORT}/api/v1/health`);
  });
}

export default app;
