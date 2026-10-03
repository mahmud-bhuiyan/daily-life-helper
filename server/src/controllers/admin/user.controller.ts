import type { Request, Response } from 'express';
import {
  createNewUser,
  deactivateUser,
  getAllUsers,
  updateExistingUser,
} from '../../services/user.service.js';
import { sendCreated, sendSuccess } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { CreateUserInput, UpdateUserInput } from '../../validators/user.validator.js';

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await getAllUsers();
  sendSuccess(res, users);
});

export const postUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await createNewUser(req.body as CreateUserInput);
  sendCreated(res, user);
});

export const patchUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await updateExistingUser(
    req.params.id as string,
    req.user!.id,
    req.body as UpdateUserInput,
  );
  sendSuccess(res, user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await deactivateUser(req.params.id as string, req.user!.id);
  sendSuccess(res, user);
});
