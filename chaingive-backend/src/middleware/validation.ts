import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      next(new AppError('Validation failed: ' + error.message, 400));
    }
  };
};