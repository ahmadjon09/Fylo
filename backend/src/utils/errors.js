export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

export const errorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

export const throwNotFound = (resource = 'Resource') => {
  throw new AppError(`${resource} not found`, 404, errorCodes.NOT_FOUND);
};

export const throwUnauthorized = (msg = 'Unauthorized') => {
  throw new AppError(msg, 401, errorCodes.UNAUTHORIZED);
};

export const throwForbidden = (msg = 'Forbidden') => {
  throw new AppError(msg, 403, errorCodes.FORBIDDEN);
};
