import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
    email?: string;
    firstName: string;
    lastName: string;
    role: string;
    tier: number;
    roleId?: string;
    permissions?: string[];
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError('JWT secret not configured', 500);
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      phoneNumber: string;
      email?: string;
      firstName: string;
      lastName: string;
      role: string;
      tier: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tier: true,
        trustScore: true,
        isAgent: true,
        isVerified: true,
        charityCoins: true,
        createdAt: true,
        updatedAt: true,
        balance: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    req.user = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email || undefined,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tier: user.tier,
      permissions: [],
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export const authMiddleware = authenticate;
export const requireRoleLevel = (minLevel: number) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (req.user.tier < minLevel) {
      return next(new AppError('Insufficient role level', 403));
    }

    next();
  };
};
