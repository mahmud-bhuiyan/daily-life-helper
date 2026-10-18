import bcrypt from 'bcrypt';
import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';
import {
  findUserByEmail,
  findUserById,
  findUserWithPasswordById,
  updateUserPassword,
  type UserProfile,
} from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/generateToken.js';
import type { ChangePasswordInput, LoginInput } from '../validators/auth.validator.js';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Vercel client + API are different sites (public suffix); cross-origin fetch needs SameSite=None. */
const usesCrossSiteAuthCookie = env.CLIENT_URL.split(',').some(
  (origin) => !/^https?:\/\/localhost(:\d+)?$/i.test(origin.trim()),
);

const authCookieOptions = (maxAge = COOKIE_MAX_AGE_MS): CookieOptions => ({
  httpOnly: true,
  secure: usesCrossSiteAuthCookie || env.APP_ENV === 'production',
  sameSite: usesCrossSiteAuthCookie ? 'none' : 'lax',
  maxAge,
  path: '/',
});

export const setAuthCookie = (res: Response, user: UserProfile): void => {
  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  res.cookie(COOKIE_NAME, token, authCookieOptions());
};

export const clearAuthCookie = (res: Response): void => {
  const { maxAge: _maxAge, ...options } = authCookieOptions();
  res.clearCookie(COOKIE_NAME, options);
};

export const login = async (input: LoginInput, res: Response): Promise<UserProfile> => {
  const user = await findUserByEmail(input.email);

  if (!user || !user.is_active) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const profile: UserProfile = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };

  setAuthCookie(res, profile);
  return profile;
};

export const getMe = async (userId: string): Promise<UserProfile> => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  return user;
};

export const changePassword = async (
  userId: string,
  input: ChangePasswordInput,
): Promise<void> => {
  const user = await findUserWithPasswordById(userId);

  if (!user || !user.is_active) {
    throw new ApiError(401, 'User not found');
  }

  const valid = await bcrypt.compare(input.currentPassword, user.password_hash);
  if (!valid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  await updateUserPassword(userId, passwordHash);
};
