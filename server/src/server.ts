import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

// Local dev only — Vercel imports the default export as a serverless function.
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`Health: http://localhost:${env.PORT}/api/v1/health`);
  });
}

export default app;
