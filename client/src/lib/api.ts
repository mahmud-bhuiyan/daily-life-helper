import type { ApiEnvelope, PaginationMeta } from "../types";

/** Prod: full API origin from Vercel env. Dev: empty — Vite proxy serves /api. */
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

/** Thrown when the API returns `{ success: false, error }` or a non-2xx status. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const parseEnvelope = async <T, M = undefined>(
  res: Response,
): Promise<ApiEnvelope<T, M>> => {
  try {
    return (await res.json()) as ApiEnvelope<T, M>;
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
export const request = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
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

export type PaginatedResponse<T> = {
  data: T;
  meta: PaginationMeta;
};

/**
 * Unwraps paginated list responses `{ success, data, meta }`.
 */
export const requestPaginated = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<PaginatedResponse<T>> => {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parseEnvelope<T, PaginationMeta>(res);

  if (!payload.success) {
    throw new ApiError(res.status, payload.error);
  }

  if (!("meta" in payload) || payload.meta === undefined) {
    throw new ApiError(500, "Missing pagination meta");
  }

  return { data: payload.data, meta: payload.meta };
};
