import { query } from '../config/db.js';

export type UserRole = 'user' | 'super_admin';

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
};

export type UserAdmin = UserProfile & {
  isActive: boolean;
  createdAt: string;
};

const toProfile = (row: UserRow): UserProfile => ({
  id: row.id,
  email: row.email,
  displayName: row.display_name,
  role: row.role,
});

const toAdmin = (row: UserRow): UserAdmin => ({
  ...toProfile(row),
  isActive: row.is_active,
  createdAt: row.created_at.toISOString(),
});

export const findUserByEmail = async (email: string): Promise<(UserRow & UserProfile) | null> => {
  const { rows } = await query(
    `SELECT id, email, password_hash, display_name, role, is_active, created_at
     FROM users WHERE email = $1`,
    [email.toLowerCase()],
  );

  const row = rows[0] as UserRow | undefined;
  if (!row) return null;

  return { ...row, ...toProfile(row) };
};

export const findUserById = async (id: string): Promise<UserProfile | null> => {
  const { rows } = await query(
    `SELECT id, email, password_hash, display_name, role, is_active, created_at
     FROM users WHERE id = $1`,
    [id],
  );

  const row = rows[0] as UserRow | undefined;
  return row ? toProfile(row) : null;
};

export const findUserWithPasswordById = async (id: string): Promise<UserRow | null> => {
  const { rows } = await query(
    `SELECT id, email, password_hash, display_name, role, is_active, created_at
     FROM users WHERE id = $1`,
    [id],
  );

  return (rows[0] as UserRow | undefined) ?? null;
};

export const listAllUsers = async (): Promise<UserAdmin[]> => {
  const { rows } = await query(
    `SELECT id, email, password_hash, display_name, role, is_active, created_at
     FROM users ORDER BY created_at DESC`,
  );

  return (rows as UserRow[]).map(toAdmin);
};

export const createUser = async (input: {
  email: string;
  passwordHash: string;
  displayName: string;
  role?: UserRole;
}): Promise<UserAdmin> => {
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, password_hash, display_name, role, is_active, created_at`,
    [input.email.toLowerCase(), input.passwordHash, input.displayName, input.role ?? 'user'],
  );

  return toAdmin(rows[0] as UserRow);
};

export const updateUserPassword = async (userId: string, passwordHash: string): Promise<void> => {
  await query('UPDATE users SET password_hash = $2 WHERE id = $1', [userId, passwordHash]);
};

export const updateUser = async (
  userId: string,
  fields: {
    displayName?: string;
    role?: UserRole;
    isActive?: boolean;
    passwordHash?: string;
  },
): Promise<UserAdmin | null> => {
  const sets: string[] = [];
  const values: unknown[] = [userId];
  let idx = 2;

  if (fields.displayName !== undefined) {
    sets.push(`display_name = $${idx++}`);
    values.push(fields.displayName);
  }
  if (fields.role !== undefined) {
    sets.push(`role = $${idx++}`);
    values.push(fields.role);
  }
  if (fields.isActive !== undefined) {
    sets.push(`is_active = $${idx++}`);
    values.push(fields.isActive);
  }
  if (fields.passwordHash !== undefined) {
    sets.push(`password_hash = $${idx++}`);
    values.push(fields.passwordHash);
  }

  if (sets.length === 0) {
    const { rows } = await query(
      `SELECT id, email, password_hash, display_name, role, is_active, created_at
       FROM users WHERE id = $1`,
      [userId],
    );
    const row = rows[0] as UserRow | undefined;
    return row ? toAdmin(row) : null;
  }

  const { rows } = await query(
    `UPDATE users SET ${sets.join(', ')}
     WHERE id = $1
     RETURNING id, email, password_hash, display_name, role, is_active, created_at`,
    values,
  );

  const row = rows[0] as UserRow | undefined;
  return row ? toAdmin(row) : null;
};
