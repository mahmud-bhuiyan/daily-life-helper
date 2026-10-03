import { Router } from 'express';
import { healthRoutes } from './health.routes.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'Server is running' });
});

apiRouter.use(healthRoutes);

// Step 02+: authRoutes, adminRoutes, categoryRoutes, itemRoutes, expenseRoutes, reportRoutes
