import Redis from 'ioredis';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Redis client for session storage
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export interface SessionData {
  userId: string;
  phoneNumber: string;
  email?: string;
  role: string;
  tier: number;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
}

export interface SessionConfig {
  maxInactivityMinutes: number;
  maxSessionHours: number;
  extendOnActivity: boolean;
}

/**
 * Default session configuration
 */
const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxInactivityMinutes: 30, // 30 minutes of inactivity
  maxSessionHours: 24 * 7, // 7 days max session
  extendOnActivity: true,
};

/**
 * Generate a secure session ID
 */
export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a new session in Redis
 */
export const createSession = async (
  userId: string,
  sessionData: Partial<SessionData>,
  config: Partial<SessionConfig> = {}
): Promise<string> => {
  try {
    const sessionId = generateSessionId();
    const sessionConfig = { ...DEFAULT_SESSION_CONFIG, ...config };

    const session: SessionData = {
      userId,
      phoneNumber: sessionData.phoneNumber!,
      email: sessionData.email,
      role: sessionData.role!,
      tier: sessionData.tier!,
      lastActivity: new Date(),
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      deviceInfo: sessionData.deviceInfo,
    };

    // Store session in Redis with expiration
    const sessionKey = `session:${sessionId}`;
    const expirationSeconds = sessionConfig.maxSessionHours * 60 * 60;

    await redis.setex(sessionKey, expirationSeconds, JSON.stringify(session));

    // Store session metadata for tracking
    await redis.sadd(`user_sessions:${userId}`, sessionId);

    logger.info(`Session created for user: ${userId}, sessionId: ${sessionId}`);

    return sessionId;
  } catch (error) {
    logger.error('Error creating session:', error);
    throw new AppError('Failed to create session', 500, 'SESSION_CREATION_FAILED');
  }
};

/**
 * Get session data from Redis
 */
export const getSession = async (sessionId: string): Promise<SessionData | null> => {
  try {
    const sessionKey = `session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return null;
    }

    const session: SessionData = JSON.parse(sessionData);

    // Check if session has expired due to inactivity
    const now = new Date();
    const lastActivity = new Date(session.lastActivity);
    const inactivityMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

    if (inactivityMinutes > DEFAULT_SESSION_CONFIG.maxInactivityMinutes) {
      // Session expired due to inactivity
      await destroySession(sessionId);
      return null;
    }

    return session;
  } catch (error) {
    logger.error('Error getting session:', error);
    return null;
  }
};

/**
 * Update session activity and extend expiration if needed
 */
export const updateSessionActivity = async (
  sessionId: string,
  newData: Partial<SessionData> = {}
): Promise<boolean> => {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      return false;
    }

    // Update last activity
    session.lastActivity = new Date();

    // Merge any new data
    Object.assign(session, newData);

    // Update in Redis with extended expiration
    const sessionKey = `session:${sessionId}`;
    const expirationSeconds = DEFAULT_SESSION_CONFIG.maxSessionHours * 60 * 60;

    await redis.setex(sessionKey, expirationSeconds, JSON.stringify(session));

    return true;
  } catch (error) {
    logger.error('Error updating session activity:', error);
    return false;
  }
};

/**
 * Destroy a specific session
 */
export const destroySession = async (sessionId: string): Promise<void> => {
  try {
    const session = await getSession(sessionId);
    if (session) {
      // Remove from user's session set
      await redis.srem(`user_sessions:${session.userId}`, sessionId);
    }

    // Delete session
    await redis.del(`session:${sessionId}`);

    logger.info(`Session destroyed: ${sessionId}`);
  } catch (error) {
    logger.error('Error destroying session:', error);
  }
};

/**
 * Destroy all sessions for a user (logout from all devices)
 */
export const destroyAllUserSessions = async (userId: string): Promise<void> => {
  try {
    const sessionIds = await redis.smembers(`user_sessions:${userId}`);

    if (sessionIds.length > 0) {
      // Delete all session keys
      const sessionKeys = sessionIds.map(id => `session:${id}`);
      await redis.del(...sessionKeys);

      // Clear user's session set
      await redis.del(`user_sessions:${userId}`);

      logger.info(`All sessions destroyed for user: ${userId}`);
    }
  } catch (error) {
    logger.error('Error destroying all user sessions:', error);
  }
};

/**
 * Get all active sessions for a user
 */
export const getUserSessions = async (userId: string): Promise<SessionData[]> => {
  try {
    const sessionIds = await redis.smembers(`user_sessions:${userId}`);
    const sessions: SessionData[] = [];

    for (const sessionId of sessionIds) {
      const session = await getSession(sessionId);
      if (session) {
        sessions.push(session);
      } else {
        // Clean up expired session from set
        await redis.srem(`user_sessions:${userId}`, sessionId);
      }
    }

    return sessions;
  } catch (error) {
    logger.error('Error getting user sessions:', error);
    return [];
  }
};

/**
 * Clean up expired sessions (maintenance function)
 */
export const cleanupExpiredSessions = async (): Promise<void> => {
  try {
    // This would be called by a cron job
    // For now, sessions expire automatically via Redis TTL
    // We could implement more sophisticated cleanup if needed
    logger.info('Session cleanup completed');
  } catch (error) {
    logger.error('Error during session cleanup:', error);
  }
};

/**
 * Validate session and return user data
 */
export const validateSession = async (sessionId: string): Promise<SessionData | null> => {
  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

  // Update activity
  await updateSessionActivity(sessionId);

  return session;
};

/**
 * Extend session expiration
 */
export const extendSession = async (sessionId: string, hours: number): Promise<boolean> => {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      return false;
    }

    const sessionKey = `session:${sessionId}`;
    const expirationSeconds = hours * 60 * 60;

    await redis.expire(sessionKey, expirationSeconds);
    return true;
  } catch (error) {
    logger.error('Error extending session:', error);
    return false;
  }
};

// Export Redis client for other services if needed
export { redis };