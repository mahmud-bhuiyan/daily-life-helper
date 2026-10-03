import type { Response } from 'express';

/** Optional meta for paginated list endpoints. */
export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
};

export type ApiSuccessResponse<T, M = undefined> =
  M extends undefined
    ? { success: true; data: T }
    : { success: true; data: T; meta: M };

export type ApiErrorResponse = {
  success: false;
  error: string;
};

export const success = <T, M = undefined>(
  data: T,
  meta?: M,
): ApiSuccessResponse<T, M> =>
  meta !== undefined
    ? ({ success: true, data, meta } as ApiSuccessResponse<T, M>)
    : ({ success: true, data } as ApiSuccessResponse<T, M>);

export const failure = (error: string): ApiErrorResponse => ({
  success: false,
  error,
});

/** Standard JSON success response — use in every controller. */
export const sendSuccess = <T, M = undefined>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: M,
) => {
  res.status(statusCode).json(success(data, meta));
};

/** 201 Created — same envelope as sendSuccess. */
export const sendCreated = <T>(res: Response, data: T) => {
  sendSuccess(res, data, 201);
};
