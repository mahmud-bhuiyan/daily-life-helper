import type { ApiEnvelope } from '../types/api';

/** Thrown when the API returns `{ success: false, error }` or a non-2xx status. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

const parseEnvelope = async <T>(res: Response): Promise<ApiEnvelope<T>> => {
  try {
    return (await res.json()) as ApiEnvelope<T>;
  } catch {
    return { success: false, error: res.statusText };
  }
};

/**
 * Central fetch wrapper for all API calls.
 * - Sends credentials (httpOnly JWT cookie) on every request
 * - JSON-encodes body when provided
 * - Unwraps `{ success: true, data }` — callers receive `data` directly
 * - Throws ApiError on `{ success: false, error }` or HTTP errors
 * - Returns undefined for 204 No Content
 */
export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { body, headers, ...rest } = options;

  const res = await fetch(path, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const payload = await parseEnvelope<T>(res);

  if (!payload.success) {
    throw new ApiError(res.status, payload.error);
  }

  return payload.data;
};
