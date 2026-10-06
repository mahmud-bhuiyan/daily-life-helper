import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import { pool } from '../src/config/db.js';

const base = 'http://localhost:4000/api/v1';
const testGlobalName = `G${Date.now().toString(36).slice(-6)}`;
const testUserName = `U${Date.now().toString(36).slice(-6)}`;

type AuthUser = { id: string; email: string; role: string };

const cookie = (user: AuthUser) => {
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  );
  return `token=${token}`;
};

async function api(user: AuthUser, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Cookie', cookie(user));
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${base}${path}`, { ...init, headers });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

const fail = (msg: string) => {
  console.error('FAIL:', msg);
  process.exit(1);
};
const ok = (msg: string) => console.log('OK:', msg);

const run = async () => {
  const { rows: users } = await pool.query<AuthUser>(
    `SELECT id, email, role FROM users WHERE is_active = true ORDER BY (role = 'super_admin') DESC`,
  );
  const superAdmin = users.find((u) => u.role === 'super_admin');
  let regular = users.find((u) => u.role === 'user');
  if (!superAdmin) fail('No super_admin user in DB');

  let tempUserId: string | null = null;
  if (!regular) {
    const tempEmail = `api-test-user-${Date.now()}@test.local`;
    const created = await api(superAdmin, '/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: tempEmail,
        password: 'test-password-123',
        displayName: 'API Test User',
        role: 'user',
      }),
    });
    if (created.status !== 201) {
      fail(`Bootstrap test user expected 201, got ${created.status} ${JSON.stringify(created.json)}`);
    }
    const body = created.json as { data?: AuthUser };
    regular = body.data ?? (created.json as AuthUser);
    tempUserId = regular.id;
    ok('Created temporary user for 403 test');
  }

  const list = await api(superAdmin, '/categories');
  if (list.status !== 200) fail(`GET /categories -> ${list.status}`);
  const wrapped = list.json as { data?: unknown };
  const arr = Array.isArray(wrapped?.data) ? wrapped.data : [];
  const hasGlobal = arr.some((c: { scope?: string }) => c.scope === 'global');
  if (!hasGlobal) fail('GET /categories should include global scope categories');
  ok(`GET /categories returns global + user categories (${arr.length} rows)`);

  const forbidden = await api(regular, '/categories', {
    method: 'POST',
    body: JSON.stringify({ name: testGlobalName, scope: 'global' }),
  });
  if (forbidden.status !== 403) {
    fail(`POST scope=global as user expected 403, got ${forbidden.status}`);
  }
  ok('POST scope=global as regular user -> 403');

  const createdGlobal = await api(superAdmin, '/categories', {
    method: 'POST',
    body: JSON.stringify({ name: testGlobalName, scope: 'global', color: '#112233' }),
  });
  if (createdGlobal.status !== 201) {
    fail(
      `POST scope=global as super_admin expected 201, got ${createdGlobal.status} ${JSON.stringify(createdGlobal.json)}`,
    );
  }
  const gBody = createdGlobal.json as { data?: { id: string; scope: string; name: string } };
  const g = gBody.data ?? (createdGlobal.json as { id: string; scope: string; name: string });
  if (g.scope !== 'global' || g.name !== testGlobalName) {
    fail(`Created global category payload wrong: ${JSON.stringify(g)}`);
  }
  ok('POST scope=global as super_admin -> 201 global category');

  const dup = await api(superAdmin, '/categories', {
    method: 'POST',
    body: JSON.stringify({ name: testGlobalName, scope: 'global' }),
  });
  if (dup.status !== 409) fail(`Duplicate global name expected 409, got ${dup.status}`);
  ok('Duplicate global name -> 409');

  const createdUser = await api(superAdmin, '/categories', {
    method: 'POST',
    body: JSON.stringify({ name: testUserName }),
  });
  if (createdUser.status !== 201) {
    fail(`POST user category expected 201, got ${createdUser.status}`);
  }
  const uBody = createdUser.json as { data?: { id: string; scope: string } };
  const u = uBody.data ?? (createdUser.json as { id: string; scope: string });
  if (u.scope !== 'user') fail('Default scope should be user');
  ok('POST without scope -> user category');

  const clash = await api(superAdmin, '/categories', {
    method: 'POST',
    body: JSON.stringify({ name: 'Food' }),
  });
  if (clash.status !== 409) fail(`User category named Food expected 409, got ${clash.status}`);
  ok('User category conflicting with global name Food -> 409');

  const delGlobal = await api(superAdmin, `/categories/${g.id}`, { method: 'DELETE' });
  if (delGlobal.status !== 204) fail(`DELETE global expected 204, got ${delGlobal.status}`);
  ok('DELETE global category as super_admin -> 204');

  const delUser = await api(superAdmin, `/categories/${u.id}`, { method: 'DELETE' });
  if (delUser.status !== 204) fail(`DELETE user cat expected 204, got ${delUser.status}`);
  ok('DELETE user category -> 204');

  if (tempUserId) {
    const deactivated = await api(superAdmin, `/admin/users/${tempUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    });
    if (deactivated.status !== 200) {
      fail(`Cleanup deactivate test user expected 200, got ${deactivated.status}`);
    }
    ok('Deactivated temporary test user');
  }

  console.log('\nAll category API checks passed.');
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
