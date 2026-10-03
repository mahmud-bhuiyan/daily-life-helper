import { pool } from '../config/db.js';

/** Runs SELECT 1 to verify Postgres connectivity. */
export const pingDatabase = async (): Promise<void> => {
  await pool.query('SELECT 1');
};
