import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import { query } from '../config/db.js';

const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#22c55e' },
  { name: 'Transport', color: '#3b82f6' },
  { name: 'Utilities', color: '#f59e0b' },
  { name: 'Shopping', color: '#a855f7' },
  { name: 'Health', color: '#ef4444' },
  { name: 'Other', color: '#6366f1' },
];

export const seedDefaultCategories = async (userId: string) => {
  for (const cat of DEFAULT_CATEGORIES) {
    await query(
      `INSERT INTO categories (user_id, name, color)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, name) DO NOTHING`,
      [userId, cat.name, cat.color],
    );
  }
};

export const bootstrapSuperAdmin = async () => {
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

  const { rows: users } = await query(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, 'super_admin')
     RETURNING id`,
    [env.SUPER_ADMIN_EMAIL, passwordHash, displayName],
  );

  await seedDefaultCategories((users[0] as { id: string }).id);
  console.log(`Bootstrap super admin: ${env.SUPER_ADMIN_EMAIL}`);
};
