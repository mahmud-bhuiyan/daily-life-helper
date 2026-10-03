import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

type ValidationSchemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

/** Parses req.body / query / params with Zod; throws ZodError → 400 via errorMiddleware. */
export const validate =
  (schemas: ValidationSchemas) => (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query) as Request['query'];
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as Request['params'];
    }
    next();
  };
