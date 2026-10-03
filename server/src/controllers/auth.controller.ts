import type { Request, Response } from 'express';
import { changePassword, clearAuthCookie, getMe, login } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { ChangePasswordInput, LoginInput } from '../validators/auth.validator.js';

export const postLogin = asyncHandler(async (req: Request, res: Response) => {
  const profile = await login(req.body as LoginInput, res);
  sendSuccess(res, profile);
});

export const postLogout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.status(204).send();
});

export const getAuthMe = asyncHandler(async (req: Request, res: Response) => {
  const profile = await getMe(req.user!.id);
  sendSuccess(res, profile);
});

export const postChangePassword = asyncHandler(async (req: Request, res: Response) => {
  await changePassword(req.user!.id, req.body as ChangePasswordInput);
  res.status(204).send();
});
