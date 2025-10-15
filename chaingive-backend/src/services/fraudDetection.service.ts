import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface FraudCheckResult {
  isFraudulent: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
  recommendedAction: 'allow' | 'flag' | 'block';
}

export interface PaymentContext {
  userId: string;
  amount: number;
  currency: string;
  gateway: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

export class FraudDetectionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Comprehensive fraud check for payments
   */
  async checkPaymentFraud(context: PaymentContext): Promise<FraudCheckResult> {
    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check 1: Amount-based fraud detection
    const amountCheck = await this.checkAmountAnomalies(context);
    if (amountCheck.isFraudulent) {
      reasons.push(...amountCheck.reasons);
      riskLevel = this.escalateRisk(riskLevel, amountCheck.riskLevel);
    }

    // Check 2: Velocity checks (transactions per time period)
    const velocityCheck = await this.checkTransactionVelocity(context);
    if (velocityCheck.isFraudulent) {
      reasons.push(...velocityCheck.reasons);
      riskLevel = this.escalateRisk(riskLevel, velocityCheck.riskLevel);
    }

    // Check 3: Geographic anomalies
    const geoCheck = await this.checkGeographicAnomalies(context);
    if (geoCheck.isFraudulent) {
      reasons.push(...geoCheck.reasons);
      riskLevel = this.escalateRisk(riskLevel, geoCheck.riskLevel);
    }

    // Check 4: Device fingerprinting
    const deviceCheck = await this.checkDeviceFingerprint(context);
    if (deviceCheck.isFraudulent) {
      reasons.push(...deviceCheck.reasons);
      riskLevel = this.escalateRisk(riskLevel, deviceCheck.riskLevel);
    }

    // Check 5: User behavior patterns
    const behaviorCheck = await this.checkUserBehaviorPatterns(context);
    if (behaviorCheck.isFraudulent) {
      reasons.push(...behaviorCheck.reasons);
      riskLevel = this.escalateRisk(riskLevel, behaviorCheck.riskLevel);
    }

    // Determine recommended action
    const recommendedAction = this.determineAction(riskLevel, reasons);

    // Log fraud check
    await this.logFraudCheck(context, {
      isFraudulent: riskLevel !== 'low',
      riskLevel,
      reasons,
      recommendedAction
    });

    return {
      isFraudulent: riskLevel === 'high',
      riskLevel,
      reasons,
      recommendedAction
    };
  }

  /**
   * Check for unusual payment amounts
   */
  private async checkAmountAnomalies(context: PaymentContext): Promise<FraudCheckResult> {
    const reasons: string[] = [];

    // Get user's payment history (using existing transaction table for now)
    const userPayments = await this.prisma.transaction.findMany({
      where: {
        fromUserId: context.userId,
        status: 'completed',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        amount: true
      }
    });

    if (userPayments.length === 0) {
      // First-time user - lower threshold
      if (context.amount > 1000) { // ₦1,000 threshold for new users
        reasons.push('Unusually high amount for first-time user');
        return { isFraudulent: true, riskLevel: 'medium', reasons, recommendedAction: 'flag' };
      }
    } else {
      // Calculate average payment amount
      const avgAmount = userPayments.reduce((sum, p) => sum + Number(p.amount), 0) / userPayments.length;
      const maxAmount = Math.max(...userPayments.map(p => Number(p.amount)));

      // Check if current amount is 5x higher than average or 3x higher than max
      if (context.amount > avgAmount * 5 || context.amount > maxAmount * 3) {
        reasons.push('Payment amount significantly higher than user history');
        return { isFraudulent: true, riskLevel: 'high', reasons, recommendedAction: 'flag' };
      }
    }

    return { isFraudulent: false, riskLevel: 'low', reasons: [], recommendedAction: 'allow' };
  }

  /**
   * Check transaction velocity (rate of transactions)
   */
  private async checkTransactionVelocity(context: PaymentContext): Promise<FraudCheckResult> {
    const reasons: string[] = [];

    // Check transactions in last hour (using existing transaction table)
    const recentTransactions = await this.prisma.transaction.count({
      where: {
        fromUserId: context.userId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });

    if (recentTransactions >= 5) {
      reasons.push('High transaction velocity - 5+ transactions in last hour');
      return { isFraudulent: true, riskLevel: 'high', reasons, recommendedAction: 'block' };
    }

    // Check transactions in last 24 hours
    const dailyTransactions = await this.prisma.transaction.count({
      where: {
        fromUserId: context.userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (dailyTransactions >= 20) {
      reasons.push('High daily transaction volume - 20+ transactions in 24 hours');
      return { isFraudulent: true, riskLevel: 'medium', reasons, recommendedAction: 'flag' };
    }

    return { isFraudulent: false, riskLevel: 'low', reasons: [], recommendedAction: 'allow' };
  }

  /**
   * Check for geographic anomalies
   */
  private async checkGeographicAnomalies(context: PaymentContext): Promise<FraudCheckResult> {
    const reasons: string[] = [];

    if (!context.ipAddress) {
      return { isFraudulent: false, riskLevel: 'low', reasons: [], recommendedAction: 'allow' };
    }

    // Get user's historical IP addresses (simplified for now - would need IP logging table)
    const knownIPs: string[] = []; // Would be populated from a separate IP logging table
    const isKnownIP = knownIPs.includes(context.ipAddress || '');

    if (!isKnownIP && knownIPs.length > 0) {
      reasons.push('Payment from unknown IP address');
      return { isFraudulent: true, riskLevel: 'medium', reasons, recommendedAction: 'flag' };
    }

    return { isFraudulent: false, riskLevel: 'low', reasons: [], recommendedAction: 'allow' };
  }

  /**
   * Check device fingerprint consistency
   */
  private async checkDeviceFingerprint(context: PaymentContext): Promise<FraudCheckResult> {
    const reasons: string[] = [];

    if (!context.deviceFingerprint) {
      return { isFraudulent: false, riskLevel: 'low', reasons: [], recommendedAction: 'allow' };
    }

    // Get user's recent device fingerprints (simplified for now)
    const knownFingerprints: string[] = []; // Would be populated from a separate device logging table
    const isKnownDevice = knownFingerprints.includes(context.deviceFingerprint || '');

    if (!isKnownDevice && knownFingerprints.length >= 3) {
      reasons.push('Payment from unrecognized device');
      return { isFraudulent: true, riskLevel: 'medium', reasons, recommendedAction: 'flag' };
    }

    return { isFraudulent: false, riskLevel: 'low', reasons: [], recommendedAction: 'allow' };
  }

  /**
   * Check user behavior patterns
   */
  private async checkUserBehaviorPatterns(context: PaymentContext): Promise<FraudCheckResult> {
    const reasons: string[] = [];

    // Get user account age
    const user = await this.prisma.user.findUnique({
      where: { id: context.userId },
      select: { createdAt: true, trustScore: true }
    });

    if (!user) {
      reasons.push('User account not found');
      return { isFraudulent: true, riskLevel: 'high', reasons, recommendedAction: 'block' };
    }

    const accountAgeDays = Math.floor((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000));

    // New accounts (< 7 days) with high amounts
    if (accountAgeDays < 7 && context.amount > 500) {
      reasons.push('High-value transaction from very new account');
      return { isFraudulent: true, riskLevel: 'medium', reasons, recommendedAction: 'flag' };
    }

    // Low trust score accounts
    if (Number(user.trustScore) < 3.0 && context.amount > 200) {
      reasons.push('High-value transaction from low-trust account');
      return { isFraudulent: true, riskLevel: 'medium', reasons, recommendedAction: 'flag' };
    }

    return { isFraudulent: false, riskLevel: 'low', reasons: [], recommendedAction: 'allow' };
  }

  /**
   * Escalate risk level
   */
  private escalateRisk(current: 'low' | 'medium' | 'high', newRisk: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high' {
    const levels = { low: 1, medium: 2, high: 3 };
    return levels[newRisk] > levels[current] ? newRisk : current;
  }

  /**
   * Determine recommended action based on risk
   */
  private determineAction(riskLevel: 'low' | 'medium' | 'high', reasons: string[]): 'allow' | 'flag' | 'block' {
    if (riskLevel === 'high') {
      return 'block';
    } else if (riskLevel === 'medium') {
      return reasons.length > 1 ? 'block' : 'flag';
    }
    return 'allow';
  }

  /**
   * Log fraud check results
   */
  private async logFraudCheck(context: PaymentContext, result: FraudCheckResult): Promise<void> {
    try {
      // For now, just log to console since we don't have the fraudCheck table yet
      logger.info('Fraud check completed', {
        userId: context.userId,
        gateway: context.gateway,
        amount: context.amount,
        riskLevel: result.riskLevel,
        isFraudulent: result.isFraudulent,
        reasons: result.reasons,
        recommendedAction: result.recommendedAction
      });
    } catch (error) {
      logger.error('Failed to log fraud check', { error, context, result });
    }
  }

  /**
   * Get fraud statistics for monitoring
   */
  async getFraudStatistics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    // For now, return mock statistics since we don't have the fraudCheck table yet
    return {
      timeframe,
      totalChecks: 0,
      byRiskLevel: { low: 0, medium: 0, high: 0 },
      byAction: { allow: 0, flag: 0, block: 0 },
      note: 'Fraud statistics will be available after database migration'
    };
  }
}