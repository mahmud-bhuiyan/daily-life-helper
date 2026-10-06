/**
 * End-to-end API smoke tests — requires Postgres (DATABASE_URL) and server on PORT (default 4000).
 *
 * Usage: npm run dev   (separate terminal)
 *        npm run test:api
 */
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import { pool } from '../src/config/db.js';

const base = `http://localhost:${env.PORT}/api/v1`;

type AuthUser = { id: string; email: string; role: string; displayName?: string };

const shortName = (prefix: string) => {
  const suffix = Date.now().toString(36).slice(-6);
  const name = `${prefix}${suffix}`;
  return name.length <= 20 ? name : name.slice(0, 20);
};

const cookieFromJwt = (user: AuthUser) => {
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  );
  return `token=${token}`;
};

async function api(path: string, init: RequestInit = {}, auth?: AuthUser) {
  const headers = new Headers(init.headers);
  if (auth) {
    headers.set('Cookie', cookieFromJwt(auth));
  }
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
  return { status: res.status, json, headers: res.headers };
}

const fail = (msg: string) => {
  console.error('FAIL:', msg);
  process.exit(1);
};
const ok = (msg: string) => console.log('OK:', msg);

const expect = (status: number, got: number, label: string, body?: unknown) => {
  if (status !== got) {
    fail(`${label} expected ${status}, got ${got}${body ? ` — ${JSON.stringify(body)}` : ''}`);
  }
  ok(label);
};

const dataOf = <T>(json: unknown): T => {
  const wrapped = json as { data?: T };
  return (wrapped.data ?? json) as T;
};

const isoRange = () => {
  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - 3);
  return { from: from.toISOString(), to: to.toISOString() };
};

const run = async () => {
  console.log(`Testing ${base}\n`);

  const health = await api('/health');
  expect(200, health.status, 'GET /health');
  const healthData = dataOf<{ status: string; database: string }>(health.json);
  if (healthData.status !== 'ok' || healthData.database !== 'connected') {
    fail(`GET /health bad payload: ${JSON.stringify(healthData)}`);
  }

  const { rows: users } = await pool.query<AuthUser>(
    `SELECT id, email, role, display_name AS "displayName"
     FROM users WHERE is_active = true
     ORDER BY (role = 'super_admin') DESC`,
  );
  const superAdmin = users.find((u) => u.role === 'super_admin');
  if (!superAdmin) fail('No active super_admin in database — run migrate with SUPER_ADMIN_* env');

  if (env.SUPER_ADMIN_EMAIL && env.SUPER_ADMIN_PASSWORD) {
    const badLogin = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: env.SUPER_ADMIN_EMAIL,
        password: 'wrong-password-xyz',
      }),
    });
    expect(401, badLogin.status, 'POST /auth/login wrong password -> 401');

    const login = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: env.SUPER_ADMIN_EMAIL,
        password: env.SUPER_ADMIN_PASSWORD,
      }),
    });
    expect(200, login.status, 'POST /auth/login super admin', login.json);
    const setCookie = login.headers.get('set-cookie');
    if (!setCookie?.includes('token=')) fail('POST /auth/login should set token cookie');

    const meWithCookie = await fetch(`${base}/auth/me`, {
      headers: { Cookie: setCookie.split(';')[0] },
    });
    expect(200, meWithCookie.status, 'GET /auth/me with login cookie');
  } else {
    const me = await api('/auth/me', {}, superAdmin);
    expect(200, me.status, 'GET /auth/me (JWT cookie)');
  }

  const unauth = await api('/categories');
  expect(401, unauth.status, 'GET /categories without auth -> 401');

  let regular = users.find((u) => u.role === 'user' && u.id !== superAdmin.id);
  let tempUserId: string | null = null;

  const adminList = await api('/admin/users', {}, superAdmin);
  expect(200, adminList.status, 'GET /admin/users');
  if (!Array.isArray(dataOf(adminList.json))) {
    fail('GET /admin/users should return an array');
  }

  if (regular) {
    const adminForbidden = await api('/admin/users', {}, regular);
    expect(403, adminForbidden.status, 'GET /admin/users as user -> 403');
  } else {
    const tempEmail = `api-${Date.now().toString(36)}@test.local`;
    const created = await api(
      '/admin/users',
      {
        method: 'POST',
        body: JSON.stringify({
          email: tempEmail,
          password: 'test-password-123',
          displayName: 'API Test',
          role: 'user',
        }),
      },
      superAdmin,
    );
    expect(201, created.status, 'POST /admin/users', created.json);
    regular = dataOf<AuthUser>(created.json);
    tempUserId = regular.id;
    const adminForbidden = await api('/admin/users', {}, regular);
    expect(403, adminForbidden.status, 'GET /admin/users as user -> 403');
  }

  const testGlobalName = shortName('G');
  const testUserName = shortName('U');

  const listCat = await api('/categories', {}, superAdmin);
  expect(200, listCat.status, 'GET /categories');
  const categories = dataOf<{ scope: string; name: string; id: string }[]>(listCat.json);
  if (!categories.some((c) => c.scope === 'global')) {
    fail('GET /categories should include global categories');
  }

  const tooLong = await api(
    '/categories',
    {
      method: 'POST',
      body: JSON.stringify({ name: 'x'.repeat(21) }),
    },
    superAdmin,
  );
  expect(400, tooLong.status, 'POST category name > 20 chars -> 400');

  const forbiddenGlobal = await api(
    '/categories',
    {
      method: 'POST',
      body: JSON.stringify({ name: shortName('X'), scope: 'global' }),
    },
    regular!,
  );
  expect(403, forbiddenGlobal.status, 'POST scope=global as user -> 403');

  const createdGlobal = await api(
    '/categories',
    {
      method: 'POST',
      body: JSON.stringify({ name: testGlobalName, scope: 'global', color: '#112233' }),
    },
    superAdmin,
  );
  expect(201, createdGlobal.status, 'POST global category', createdGlobal.json);
  const globalCat = dataOf<{ id: string; scope: string; name: string }>(createdGlobal.json);

  const patchGlobal = await api(
    `/categories/${globalCat.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ name: shortName('Gg') }),
    },
    superAdmin,
  );
  expect(200, patchGlobal.status, 'PATCH global category', patchGlobal.json);

  const createdUserCat = await api(
    '/categories',
    { method: 'POST', body: JSON.stringify({ name: testUserName }) },
    superAdmin,
  );
  expect(201, createdUserCat.status, 'POST user category');
  const userCat = dataOf<{ id: string; scope: string }>(createdUserCat.json);
  if (userCat.scope !== 'user') fail('Default category scope should be user');

  const foodClash = await api(
    '/categories',
    { method: 'POST', body: JSON.stringify({ name: 'Food' }) },
    superAdmin,
  );
  expect(409, foodClash.status, 'POST user category Food -> 409');

  const itemName = shortName('Onion');
  const itemsList = await api('/items', {}, superAdmin);
  expect(200, itemsList.status, 'GET /items');

  const newItem = await api(
    '/items',
    { method: 'POST', body: JSON.stringify({ name: itemName, unit: 'kg' }) },
    superAdmin,
  );
  expect(201, newItem.status, 'POST /items', newItem.json);
  const item = dataOf<{ id: string; name: string }>(newItem.json);

  const itemsSearch = await api('/items?search=Oni', {}, superAdmin);
  expect(200, itemsSearch.status, 'GET /items?search=');

  const range = isoRange();
  const priceHist = await api(
    `/items/${item.id}/price-history?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`,
    {},
    superAdmin,
  );
  expect(200, priceHist.status, 'GET /items/:id/price-history');

  const expenseCreate = await api(
    '/expenses',
    {
      method: 'POST',
      body: JSON.stringify({
        amountMinor: 15000,
        categoryId: userCat.id,
        itemId: item.id,
        quantity: 2,
        unitPrice: 75,
        note: 'API test expense',
        spentAt: new Date().toISOString(),
      }),
    },
    superAdmin,
  );
  expect(201, expenseCreate.status, 'POST /expenses', expenseCreate.json);
  const expense = dataOf<{ id: string }>(expenseCreate.json);

  const expenseList = await api('/expenses?page=1&limit=10', {}, superAdmin);
  expect(200, expenseList.status, 'GET /expenses');
  const listWrap = expenseList.json as { data?: unknown; meta?: { total: number } };
  if (!Array.isArray(listWrap.data) || !listWrap.meta?.total) {
    fail('GET /expenses should return data + meta');
  }

  const expensePatch = await api(
    `/expenses/${expense.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ note: 'Updated via API test' }),
    },
    superAdmin,
  );
  expect(200, expensePatch.status, 'PATCH /expenses/:id', expensePatch.json);

  const summary = await api('/reports/summary?period=month', {}, superAdmin);
  expect(200, summary.status, 'GET /reports/summary?period=month');

  const byCat = await api(
    `/reports/by-category?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`,
    {},
    superAdmin,
  );
  expect(200, byCat.status, 'GET /reports/by-category');

  const topItems = await api(
    `/reports/top-items?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}&limit=5`,
    {},
    superAdmin,
  );
  expect(200, topItems.status, 'GET /reports/top-items');

  const priceAfterExpense = await api(
    `/items/${item.id}/price-history?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(new Date().toISOString())}`,
    {},
    superAdmin,
  );
  expect(200, priceAfterExpense.status, 'GET price-history after expense');
  const points = dataOf<{ points: unknown[] }>(priceAfterExpense.json);
  if (!points.points?.length) {
    fail('Price history should include points after expense with unit price');
  }

  const delExpense = await api(`/expenses/${expense.id}`, { method: 'DELETE' }, superAdmin);
  expect(204, delExpense.status, 'DELETE /expenses/:id');

  const delUserCat = await api(`/categories/${userCat.id}`, { method: 'DELETE' }, superAdmin);
  expect(204, delUserCat.status, 'DELETE user category');

  const delGlobal = await api(`/categories/${globalCat.id}`, { method: 'DELETE' }, superAdmin);
  expect(204, delGlobal.status, 'DELETE global category');

  if (tempUserId) {
    const deleted = await api(
      `/admin/users/${tempUserId}`,
      { method: 'DELETE' },
      superAdmin,
    );
    expect(200, deleted.status, 'DELETE /admin/users/:id (deactivate)');
  }

  const logout = await api('/auth/logout', { method: 'POST' }, superAdmin);
  expect(204, logout.status, 'POST /auth/logout');

  console.log('\nAll API checks passed.');
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());
