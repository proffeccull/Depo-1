import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FraudDetectionService } from '../services/fraudDetection.service';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const fraudService = new FraudDetectionService(prisma);

interface FraudCheckRequest {
  userId: string;
  amount: number;
  currency: string;
  gateway: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  location?: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
}

/**
 * Check payment for fraud
 */
export const checkPaymentFraud = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const context: FraudCheckRequest = req.body;

    if (!context.userId || !context.amount || !context.currency) {
      throw new AppError('User ID, amount, and currency are required', 400, 'MISSING_PARAMETERS');
    }

    const result = await fraudService.checkPaymentFraud(context);

    // Log fraud check result
    logger.info('Fraud check completed', {
      userId: context.userId,
      amount: context.amount,
      riskLevel: result.riskLevel,
      isFraudulent: result.isFraudulent,
      reasons: result.reasons,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get fraud statistics and analytics
 */
export const getFraudStatistics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { timeframe = 'month' } = req.query;

    const stats = await fraudService.getFraudStatistics(timeframe as 'day' | 'week' | 'month');

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Report false positive fraud detection
 */
export const reportFalsePositive = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { transactionId, reason } = req.body;
    const userId = req.user!.id;

    if (!transactionId) {
      throw new AppError('Transaction ID is required', 400, 'MISSING_TRANSACTION_ID');
    }

    await fraudService.reportFalsePositive(userId, transactionId, reason);

    logger.info('False positive reported', { userId, transactionId, reason });

    res.status(200).json({
      success: true,
      message: 'False positive reported successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's fraud risk profile
 */
export const getUserRiskProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const profile = await fraudService.getUserRiskProfile(userId);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually review and update fraud decision
 */
export const reviewFraudDecision = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { transactionId, decision, reason, reviewerNotes } = req.body;
    const reviewerId = req.user!.id;

    if (!transactionId || !decision) {
      throw new AppError('Transaction ID and decision are required', 400, 'MISSING_PARAMETERS');
    }

    if (!['approve', 'deny', 'escalate'].includes(decision)) {
      throw new AppError('Invalid decision. Must be approve, deny, or escalate', 400, 'INVALID_DECISION');
    }

    const result = await fraudService.reviewFraudDecision(
      transactionId,
      decision as 'approve' | 'deny' | 'escalate',
      reviewerId,
      reason,
      reviewerNotes
    );

    logger.info('Fraud decision reviewed', {
      transactionId,
      decision,
      reviewerId,
      reason,
    });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Fraud decision updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending fraud reviews (admin only)
 */
export const getPendingReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, riskLevel } = req.query;

    const result = await fraudService.getPendingReviews(
      parseInt(page as string),
      parseInt(limit as string),
      riskLevel as 'low' | 'medium' | 'high'
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get fraud alerts and notifications
 */
export const getFraudAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { acknowledged = false, limit = 50 } = req.query;

    const alerts = await fraudService.getFraudAlerts(
      req.user!.id,
      acknowledged === 'true',
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      data: {
        alerts,
        total: alerts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Acknowledge fraud alert
 */
export const acknowledgeAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { alertId } = req.params;
    const userId = req.user!.id;

    if (!alertId) {
      throw new AppError('Alert ID is required', 400, 'MISSING_ALERT_ID');
    }

    await fraudService.acknowledgeAlert(alertId, userId);

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Train fraud detection model (admin only)
 */
export const trainFraudModel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // This would be an admin-only endpoint
    await fraudService.trainAnomalyDetectionModel();

    logger.info('Fraud detection model training initiated');

    res.status(200).json({
      success: true,
      message: 'Fraud detection model training initiated successfully',
    });
  } catch (error) {
    next(error);
  }
};