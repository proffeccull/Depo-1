import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error with additional context for premium features
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Handle specific error types for premium features
  if (err.code === 'VALIDATION_ERROR') {
    return res.status(400).json({
      success: false,
      error: {
        code: err.code,
        message: 'Validation failed',
        details: err.details,
      },
    });
  }

  if (err.code === 'PAYMENT_ERROR') {
    return res.status(402).json({
      success: false,
      error: {
        code: err.code,
        message: 'Payment processing failed',
        details: err.details,
      },
    });
  }

  if (err.code === 'FEATURE_NOT_AVAILABLE') {
    return res.status(403).json({
      success: false,
      error: {
        code: err.code,
        message: 'Feature not available in current plan',
        details: err.details,
      },
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err.details,
      }),
    },
  });
};

export class AppError extends Error implements ApiError {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'APP_ERROR';
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
