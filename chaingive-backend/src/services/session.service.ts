import Redis from 'ioredis';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Redis client for session storage (optional - will work without Redis)
let redis: Redis | null = null;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  redis.on('error', (err) => {
    logger.warn('Redis connection failed, sessions will use memory fallback:', err.message);
    redis = null;
  });
} catch (error) {
  logger.warn('Redis not available, sessions will use memory fallback');
  redis = null;
}
// In-memory session store as fallback
const memorySessions = new Map<string, any>();

export const createSession = async (userId: string, data: any = {}) => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const sessionData = {
    userId,
    ...data,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  if (redis) {
    await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(sessionData));
  } else {
    memorySessions.set(sessionId, sessionData);
  }

  return sessionId;
};

export const destroySession = async (sessionId: string) => {
  if (redis) {
    await redis.del(`session:${sessionId}`);
  } else {
    memorySessions.delete(sessionId);
  }
};

export const destroyAllUserSessions = async (userId: string) => {
  if (redis) {
    const keys = await redis.keys(`session:*`);
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          await redis.del(key);
        }
      }
    }
  } else {
    for (const [sessionId, session] of memorySessions.entries()) {
      if (session.userId === userId) {
        memorySessions.delete(sessionId);
      }
    }
  }
};

export const getUserSessions = async (userId: string) => {
  const sessions: any[] = [];

  if (redis) {
    const keys = await redis.keys(`session:*`);
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          sessions.push({ sessionId: key.replace('session:', ''), ...session });
        }
      }
    }
  } else {
    for (const [sessionId, session] of memorySessions.entries()) {
      if (session.userId === userId) {
        sessions.push({ sessionId, ...session });
      }
    }
  }

  return sessions;
};

export const validateSession = async (sessionId: string) => {
  let sessionData: any = null;

  if (redis) {
    const data = await redis.get(`session:${sessionId}`);
    if (data) {
      sessionData = JSON.parse(data);
    }
  } else {
    sessionData = memorySessions.get(sessionId);
  }

  if (!sessionData) {
    return null;
  }

  // Check if session is expired
  if (new Date(sessionData.expiresAt) < new Date()) {
    await destroySession(sessionId);
    return null;
  }

  return sessionData;
};