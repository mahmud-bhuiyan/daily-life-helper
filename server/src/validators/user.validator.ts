import { z } from 'zod';

const userRoleSchema = z.enum(['user', 'super_admin']);

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(100),
  role: userRoleSchema.optional(),
});

export const updateUserSchema = z
  .object({
    displayName: z.string().min(1).max(100).optional(),
    role: userRoleSchema.optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8).optional(),
  })
  .refine(
    (data) =>
      data.displayName !== undefined ||
      data.role !== undefined ||
      data.isActive !== undefined ||
      data.password !== undefined,
    { message: 'At least one field is required' },
  );

export const userIdParamSchema = z.object({
  id: z.uuid(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
