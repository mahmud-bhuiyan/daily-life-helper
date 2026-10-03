/** Matches server `utils/apiResponse.ts` — keep both in sync. */

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

export type ApiEnvelope<T, M = undefined> =
  | ApiSuccessResponse<T, M>
  | ApiErrorResponse;
