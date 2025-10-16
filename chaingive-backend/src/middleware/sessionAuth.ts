import { Request, Response, NextFunction } from 'express';
import { validateSession, updateSessionActivity, SessionData } from '../services/session.service';
import { AppError } from './errorHandler';
import logger from '../utils/logger';

// Extend Express Request interface to include session data
declare global {
  namespace Express {
    interface Request {
      session?: SessionData;
      sessionId?: string;
    }
  }
}

/**
 * Middleware to authenticate admin users with session validation and MFA
 */
export const requireAdminSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = req.headers['x-session-id'] as string ||
                     req.cookies?.sessionId ||
                     req.query.sessionId as string;

    if (!sessionId) {
      throw new AppError('Session ID required', 401, 'SESSION_ID_MISSING');
    }

    // Validate session
    const session = await validateSession(sessionId);
    if (!session) {
      throw new AppError('Invalid or expired session', 401, 'INVALID_SESSION');
    }

    // Check if user has admin role
    if (!['agent', 'csc_council'].includes(session.role)) {
      throw new AppError('Admin access required', 403, 'ADMIN_ACCESS_REQUIRED');
    }

    // Attach session data to request
    req.session = session;
    req.sessionId = sessionId;

    // Update session activity
    await updateSessionActivity(sessionId, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      lastActivity: new Date(),
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to track user activity and extend sessions
 */
export const trackActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only track activity if we have a valid session
    if (req.session && req.sessionId) {
      await updateSessionActivity(req.sessionId, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        lastActivity: new Date(),
      });
    }
    next();
  } catch (error) {
    // Don't fail the request if activity tracking fails
    logger.error('Activity tracking error:', error);
    next();
  }
};

/**
 * Middleware to check session inactivity and auto-logout
 */
export const checkInactivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.session && req.sessionId) {
      const now = new Date();
      const lastActivity = new Date(req.session.lastActivity);
      const inactivityMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

      // Check against 30-minute inactivity limit
      if (inactivityMinutes > 30) {
        // Session expired due to inactivity
        throw new AppError('Session expired due to inactivity', 401, 'SESSION_INACTIVE');
      }

      // Warn user if approaching inactivity limit (25 minutes)
      if (inactivityMinutes > 25) {
        res.setHeader('X-Session-Warning', 'Session will expire soon due to inactivity');
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require MFA verification for sensitive admin operations
 */
export const requireMFAVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.session) {
      throw new AppError('Session required', 401, 'SESSION_REQUIRED');
    }

    // Check if user has MFA enabled
    const user = await import('../utils/prisma').then(({ default: prisma }) =>
      prisma.user.findUnique({
        where: { id: req.session!.userId },
        select: { mfaEnabled: true, mfaSecret: true },
      })
    );

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // If MFA is enabled, check if it was verified in this session
    if (user.mfaEnabled) {
      const mfaVerified = req.headers['x-mfa-verified'] === 'true' ||
                         req.body?.mfaVerified === true;

      if (!mfaVerified) {
        throw new AppError('MFA verification required', 403, 'MFA_REQUIRED');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to log admin actions for audit trail
 */
export const logAdminAction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.session && req.method !== 'GET' && req.method !== 'HEAD') {
      logger.info(`Admin action: ${req.method} ${req.path}`, {
        userId: req.session.userId,
        role: req.session.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionId,
      });
    }
    next();
  } catch (error) {
    // Don't fail the request if logging fails
    logger.error('Admin action logging error:', error);
    next();
  }
};

/**
 * Combined middleware for admin routes requiring full security
 */
export const secureAdminMiddleware = [
  requireAdminSession,
  checkInactivity,
  trackActivity,
  requireMFAVerification,
  logAdminAction,
];

/**
 * Middleware for admin routes with session validation but optional MFA
 */
export const adminSessionMiddleware = [
  requireAdminSession,
  checkInactivity,
  trackActivity,
  logAdminAction,
];