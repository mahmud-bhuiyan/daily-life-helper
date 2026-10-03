declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: 'user' | 'super_admin';
    };
  }
}

export {};
