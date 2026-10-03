import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// Neon and other remote Postgres hosts need SSL; local dev typically does not
const useSsl = !env.DATABASE_URL.includes('localhost');

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);
