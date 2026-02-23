export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(r = "Resource") { super(404, `${r} not found`, "NOT_FOUND"); }
}
export class UnauthorizedError extends AppError {
  constructor(m = "Unauthorized") { super(401, m, "UNAUTHORIZED"); }
}
export class ForbiddenError extends AppError {
  constructor(m = "Forbidden") { super(403, m, "FORBIDDEN"); }
}
export class ConflictError extends AppError {
  constructor(m = "Conflict") { super(409, m, "CONFLICT"); }
}
export class ValidationError extends AppError {
  constructor(m = "Validation failed") { super(422, m, "VALIDATION_ERROR"); }
}
