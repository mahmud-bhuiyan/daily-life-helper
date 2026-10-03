import cors from 'cors';
import { env } from './env.js';

// credentials: true required so the browser sends the httpOnly JWT cookie on API calls
export const corsMiddleware = cors({
  origin: env.CLIENT_URL,
  credentials: true,
});
