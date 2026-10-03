import type { Request } from 'express';
import type { UserRole } from '../models/user.model.js';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

/** Request after requireAuth — user is always set. */
export type AuthenticatedRequest = Request & {
  user: AuthUser;
};

/** Request that may receive user from requireAuth middleware. */
export type AuthRequest = Request & {
  user?: AuthUser;
};
