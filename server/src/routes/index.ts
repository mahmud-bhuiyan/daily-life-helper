import { Router } from 'express';
import { adminUserRoutes } from './admin/user.routes.js';
import { authRoutes } from './auth.routes.js';
import { healthRoutes } from './health.routes.js';

/**
 * Central API router — all endpoints live under /api/v1.
 * Each domain file documents its routes in full above the handler registration.
 *
 * Mounted:
 *   health.routes.ts     — GET /health
 *   auth.routes.ts       — POST /auth/login, /auth/logout, GET /auth/me, POST /auth/change-password
 *   admin/user.routes.ts — CRUD /admin/users (super_admin only)
 *
 * Planned (Step 03+):
 *   category.routes.ts   — GET/POST /categories
 *   item.routes.ts       — GET/POST /items, GET /items/:id/price-history
 *   expense.routes.ts    — GET/POST /expenses, PATCH/DELETE /expenses/:id
 *   report.routes.ts     — GET /reports/summary, /by-category, /top-items
 *
 * Full request/response specs: docs/openapi.yaml
 */
export const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use(authRoutes);
apiRouter.use(adminUserRoutes);
