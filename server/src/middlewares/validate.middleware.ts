import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

type ValidationSchemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

/** Express 5 makes req.query (and sometimes body/params) read-only — replace via defineProperty. */
const setReqField = <K extends 'body' | 'query' | 'params'>(
  req: Request,
  key: K,
  value: Request[K],
) => {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
};

/** Parses req.body / query / params with Zod; throws ZodError → 400 via errorMiddleware. */
export const validate =
  (schemas: ValidationSchemas) => (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      setReqField(req, 'body', schemas.body.parse(req.body));
    }
    if (schemas.query) {
      setReqField(req, 'query', schemas.query.parse(req.query) as Request['query']);
    }
    if (schemas.params) {
      setReqField(req, 'params', schemas.params.parse(req.params) as Request['params']);
    }
    next();
  };
