import dns from 'node:dns';
import net from 'node:net';
import pg from 'pg';
import { env } from './env.js';

const isLocalDb = env.DATABASE_URL.includes('localhost');

// Local dev only: Node 20+ autoSelectFamily + pg's socket.connect(port, host) can ETIMEDOUT when IPv6 is unreachable.
if (env.APP_ENV === 'development' && !isLocalDb) {
  dns.setDefaultResultOrder('ipv4first');
  net.setDefaultAutoSelectFamily(false);
}

const { Pool } = pg;

// Neon and other remote Postgres hosts need SSL; local dev typically does not
const useSsl = !isLocalDb;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

/** Convenience wrapper for single-statement queries (no transaction). */
export const query = (text: string, params?: unknown[]) => pool.query(text, params);
