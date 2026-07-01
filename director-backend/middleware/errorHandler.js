import { AppError, ErrorCodes } from '../lib/errors.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  console.error('[unhandled]', err);
  res.status(500).json({
    error: {
      code: ErrorCodes.INTERNAL,
      message: 'Internal server error',
    },
  });
}
