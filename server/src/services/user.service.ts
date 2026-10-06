import bcrypt from 'bcrypt';
import {
  createUser,
  findUserByEmail,
  listAllUsers,
  updateUser,
  type UserAdmin,
} from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import type { CreateUserInput, UpdateUserInput } from '../validators/user.validator.js';

export const getAllUsers = async (): Promise<UserAdmin[]> => listAllUsers();

export const createNewUser = async (input: CreateUserInput): Promise<UserAdmin> => {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ApiError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await createUser({
    email: input.email,
    passwordHash,
    displayName: input.displayName,
    role: input.role,
  });

  return user;
};

export const updateExistingUser = async (
  targetId: string,
  actorId: string,
  input: UpdateUserInput,
): Promise<UserAdmin> => {
  if (input.isActive === false && targetId === actorId) {
    throw new ApiError(400, 'Cannot deactivate your own account');
  }

  const fields: Parameters<typeof updateUser>[1] = {};

  if (input.displayName !== undefined) fields.displayName = input.displayName;
  if (input.role !== undefined) fields.role = input.role;
  if (input.isActive !== undefined) fields.isActive = input.isActive;
  if (input.password !== undefined) {
    fields.passwordHash = await bcrypt.hash(input.password, 12);
  }

  const user = await updateUser(targetId, fields);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const deactivateUser = async (targetId: string, actorId: string): Promise<UserAdmin> =>
  updateExistingUser(targetId, actorId, { isActive: false });
