/** Throw from services/controllers for expected HTTP errors (401, 403, 404, etc.). */
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}
