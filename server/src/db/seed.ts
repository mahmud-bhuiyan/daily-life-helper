import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { GLOBAL_CATEGORIES } from './globalCategories.js';

/** Ensures global categories exist (safe to re-run). */
export const seedGlobalCategories = async () => {
  for (const cat of GLOBAL_CATEGORIES) {
    await query(
      `INSERT INTO categories (user_id, name, color)
       SELECT NULL, $1, $2
       WHERE NOT EXISTS (
         SELECT 1 FROM categories WHERE user_id IS NULL AND lower(name) = lower($1)
       )`,
      [cat.name, cat.color],
    );
  }
};

/** Creates the first super_admin only when users table is empty. */
export const bootstrapSuperAdmin = async () => {
  await seedGlobalCategories();

  const { rows } = await query('SELECT COUNT(*)::text AS count FROM users');
  const count = Number((rows[0] as { count: string }).count);

  if (count > 0) {
    console.log('Users exist — skipping super admin bootstrap');
    return;
  }

  if (!env.SUPER_ADMIN_EMAIL || !env.SUPER_ADMIN_PASSWORD) {
    throw new Error(
      'No users in database. Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env, then run migrate again.',
    );
  }

  const displayName = env.SUPER_ADMIN_NAME ?? 'Super Admin';
  const passwordHash = await bcrypt.hash(env.SUPER_ADMIN_PASSWORD, 12);

  await query(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, 'super_admin')`,
    [env.SUPER_ADMIN_EMAIL, passwordHash, displayName],
  );

  console.log(`Bootstrap super admin: ${env.SUPER_ADMIN_EMAIL}`);
};
