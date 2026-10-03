import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/** Wraps async controllers so rejected promises reach errorMiddleware. */
export const asyncHandler = <TReq extends Request = Request>(handler: AsyncRouteHandler<TReq>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req as TReq, res, next)).catch(next);
  };
