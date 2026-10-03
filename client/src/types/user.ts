export type UserRole = "user" | "super_admin";

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
};

export type UserAdmin = UserProfile & {
  isActive: boolean;
  createdAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type CreateUserInput = {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
};

export type UpdateUserInput = {
  displayName?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
};
