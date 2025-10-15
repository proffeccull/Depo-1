import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import logger from '../utils/logger';
import { AppError } from './errorHandler';

// Initialize Redis client
let redisClient: Redis | null = null;

try {
  if (process.env.REDIS_HOST) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      enableOfflineQueue: false,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected for rate limiting');
    });
  }
} catch (error) {
  logger.warn('Redis not available, using in-memory rate limiter');
}

/**
 * Create rate limiter instance (Redis or Memory fallback)
 */
function createRateLimiter(points: number, duration: number) {
  if (redisClient) {
    return new RateLimiterRedis({
      storeClient: redisClient,
      points, // Number of requests
      duration, // Per duration in seconds
      blockDuration: 60, // Block for 1 minute after limit
    });
  } else {
    // Fallback to in-memory if Redis not available
    return new RateLimiterMemory({
      points,
      duration,
      blockDuration: 60,
    });
  }
}

// Different rate limiters for different endpoints
export const loginLimiter = createRateLimiter(5, 60); // 5 requests per minute
export const registerLimiter = createRateLimiter(3, 3600); // 3 per hour
export const otpLimiter = createRateLimiter(3, 300); // 3 per 5 minutes
export const donationLimiter = createRateLimiter(10, 3600); // 10 per hour
export const withdrawalLimiter = createRateLimiter(5, 3600); // 5 per hour
export const uploadLimiter = createRateLimiter(20, 3600); // 20 per hour
export const apiLimiter = createRateLimiter(100, 60); // 100 per minute (general API)

/**
 * Rate limiting middleware factory
 */
export function rateLimitMiddleware(limiter: any, message?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get identifier (user ID if authenticated, else IP)
      const identifier = (req as any).user?.id || req.ip || 'anonymous';

      await limiter.consume(identifier);
      next();
    } catch (rejRes: any) {
      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000) || 60;

      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(limiter.points));
      res.set('X-RateLimit-Remaining', String(rejRes.remainingPoints || 0));
      res.set('X-RateLimit-Reset', String(new Date(Date.now() + rejRes.msBeforeNext)));
      
      logger.warn(`Rate limit exceeded for ${identifier} on ${req.path}`);

      res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please try again later.',
        retryAfter,
      });
    }
  };
}

/**
 * Tier-based rate limiting
 * Higher tier users get more requests
 */
export function tierBasedRateLimiter(
  tier1Points: number,
  tier2Points: number,
  tier3Points: number,
  duration: number
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const identifier = user?.id || req.ip || 'anonymous';

      // Determine points based on user tier
      let points = tier1Points; // Default: Tier 1
      if (user?.tier === 2) points = tier2Points;
      if (user?.tier === 3) points = tier3Points;

      // Create dynamic rate limiter
      const limiter = createRateLimiter(points, duration);
      await limiter.consume(identifier);

      next();
    } catch (rejRes: any) {
      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000) || 60;

      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Upgrade your tier for higher limits.',
        retryAfter,
      });
    }
  };
}

/**
 * Suspicious activity detector
 * Blocks IPs with unusual patterns
 */
const suspiciousIPs = new Set<string>();

export async function detectSuspiciousActivity(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || 'unknown';

  if (suspiciousIPs.has(ip)) {
    logger.warn(`Blocked suspicious IP: ${ip}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Contact support if you believe this is an error.',
    });
  }

  // Check for suspicious patterns
  const failedAttempts = await checkFailedAttempts(ip);
  if (failedAttempts > 10) {
    suspiciousIPs.add(ip);
    logger.error(`IP ${ip} marked as suspicious (${failedAttempts} failed attempts)`);

    // Auto-unblock after 1 hour
    setTimeout(() => {
      suspiciousIPs.delete(ip);
      logger.info(`IP ${ip} unblocked after timeout`);
    }, 3600000);
  }

  next();
}

/**
 * Check failed authentication attempts (helper)
 */
async function checkFailedAttempts(ip: string): Promise<number> {
  // This would query Redis or database for failed login attempts
  // For now, return 0 (implement based on your auth logging)
  return 0;
}

/**
 * Reset rate limit for a user (admin function)
 */
export async function resetRateLimitForUser(userId: string) {
  if (!redisClient) {
    logger.warn('Cannot reset rate limit: Redis not available');
    return false;
  }

  try {
    const keys = await redisClient.keys(`*${userId}*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info(`Rate limit reset for user ${userId}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Failed to reset rate limit:', error);
    return false;
  }
}
