import { AppError } from '../utils/errors.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  try {
    const data = req[source];
    const result = schema.safeParse(data);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', details);
    }
    req[source] = result.data;
    next();
  } catch (err) {
    next(err);
  }
};
