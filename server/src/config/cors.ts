import cors from 'cors';
import { env } from './env.js';

const allowedOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim());

// credentials: true required so the browser sends the httpOnly JWT cookie on API calls
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Non-browser clients (curl, health checks) send no Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
});
