import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(32), // required now; used once auth routes land in Step 02
  // First migrate only — omit when live DB already has users
  SUPER_ADMIN_EMAIL: z.email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(8).optional(),
  SUPER_ADMIN_NAME: z.string().min(1).optional(),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
