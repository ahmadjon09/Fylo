import { env } from '../config/env.js';

export const notFound = (req, _res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

export const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Log
  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: Object.values(err.errors).map((e) => e.message).join(', '),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      code: 'CONFLICT',
      message: 'Duplicate entry',
      details: err.keyValue,
    });
  }

  res.status(status).json({
    success: false,
    code,
    message: err.message || 'Internal Server Error',
    details: err.details || undefined,
    stack: env.isProd ? undefined : err.stack,
  });
};
