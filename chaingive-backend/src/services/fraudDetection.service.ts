import { Injectable } from 'inversify';
import axios from 'axios';
import logger from '../utils/logger';

export interface TransactionData {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'donation' | 'withdrawal' | 'purchase';
  location?: {
    country: string;
    city: string;
    ip?: string;
  };
  deviceFingerprint?: string;
  timestamp: Date;
  userHistory?: {
    totalTransactions: number;
    averageAmount: number;
    lastTransactionDate: Date;
    trustScore: number;
  };
}

export interface FraudScore {
  score: number; // 0-100, higher = more fraudulent
  risk: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  recommendedAction: 'allow' | 'review' | 'block';
  confidence: number; // 0-1
}

@Injectable()
export class FraudDetectionService {
  private readonly aiServiceUrl: string;
  private readonly riskThresholds = {
    low: 30,
    medium: 60,
    high: 80,
    critical: 95
  };

  constructor() {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
  }

  /**
   * Analyze transaction for fraud patterns
   */
  async analyzeTransaction(transaction: TransactionData): Promise<FraudScore> {
    try {
      logger.info('Analyzing transaction for fraud', { transactionId: transaction.id });

      // Get AI-powered fraud score
      const aiScore = await this.getAIScore(transaction);

      // Apply rule-based checks
      const ruleViolations = await this.applyRuleBasedChecks(transaction);

      // Combine scores
      const combinedScore = this.combineScores(aiScore, ruleViolations);

      // Determine risk level and action
      const riskLevel = this.determineRiskLevel(combinedScore.score);
      const recommendedAction = this.determineAction(combinedScore.score, ruleViolations);

      const fraudScore: FraudScore = {
        score: combinedScore.score,
        risk: riskLevel,
        reasons: [...aiScore.reasons, ...ruleViolations],
        recommendedAction,
        confidence: combinedScore.confidence
      };

      logger.info('Fraud analysis completed', {
        transactionId: transaction.id,
        score: fraudScore.score,
        risk: fraudScore.risk,
        action: fraudScore.recommendedAction
      });

      return fraudScore;
    } catch (error) {
      logger.error('Error analyzing transaction for fraud', {
        transactionId: transaction.id,
        error: error.message
      });

      // Return conservative score on error
      return {
        score: 50,
        risk: 'medium',
        reasons: ['Analysis failed - manual review required'],
        recommendedAction: 'review',
        confidence: 0.5
      };
    }
  }

  /**
   * Get fraud score from AI service
   */
  private async getAIScore(transaction: TransactionData): Promise<{ score: number; reasons: string[]; confidence: number }> {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/fraud/analyze`, {
        transaction: {
          amount: transaction.amount,
          currency: transaction.currency,
          type: transaction.type,
          location: transaction.location,
          deviceFingerprint: transaction.deviceFingerprint,
          userHistory: transaction.userHistory
        }
      }, {
        timeout: 5000 // 5 second timeout
      });

      return response.data;
    } catch (error) {
      logger.warn('AI fraud service unavailable, using fallback', { error: error.message });

      // Fallback scoring based on basic heuristics
      return this.fallbackScoring(transaction);
    }
  }

  /**
   * Apply rule-based fraud detection checks
   */
  private async applyRuleBasedChecks(transaction: TransactionData): Promise<string[]> {
    const violations: string[] = [];

    // Amount-based checks
    if (transaction.amount > 50000) {
      violations.push('Unusually high transaction amount');
    }

    if (transaction.userHistory && transaction.amount > transaction.userHistory.averageAmount * 5) {
      violations.push('Amount significantly higher than user average');
    }

    // Location-based checks
    if (transaction.location) {
      // Check for unusual location patterns
      if (transaction.userHistory && transaction.location.country !== 'NG') {
        violations.push('Transaction from outside Nigeria');
      }
    }

    // Time-based checks
    const now = new Date();
    const hour = now.getHours();

    // Suspicious hours (2 AM - 5 AM)
    if (hour >= 2 && hour <= 5) {
      violations.push('Transaction during suspicious hours');
    }

    // Frequency checks
    if (transaction.userHistory) {
      const timeSinceLastTransaction = now.getTime() - transaction.userHistory.lastTransactionDate.getTime();
      const hoursSinceLast = timeSinceLastTransaction / (1000 * 60 * 60);

      if (hoursSinceLast < 1 && transaction.userHistory.totalTransactions > 10) {
        violations.push('Unusually frequent transactions');
      }
    }

    // Trust score check
    if (transaction.userHistory && transaction.userHistory.trustScore < 50) {
      violations.push('Low user trust score');
    }

    return violations;
  }

  /**
   * Fallback scoring when AI service is unavailable
   */
  private fallbackScoring(transaction: TransactionData): { score: number; reasons: string[]; confidence: number } {
    let score = 0;
    const reasons: string[] = [];

    // Basic scoring logic
    if (transaction.amount > 100000) score += 40;
    if (transaction.amount > 50000) score += 20;

    if (transaction.userHistory) {
      if (transaction.amount > transaction.userHistory.averageAmount * 3) score += 25;
      if (transaction.userHistory.trustScore < 30) score += 30;
      if (transaction.userHistory.totalTransactions < 3) score += 15;
    }

    if (score > 0) {
      reasons.push('Fallback scoring applied due to AI service unavailability');
    }

    return {
      score: Math.min(score, 100),
      reasons,
      confidence: 0.6
    };
  }

  /**
   * Combine AI and rule-based scores
   */
  private combineScores(
    aiScore: { score: number; reasons: string[]; confidence: number },
    ruleViolations: string[]
  ): { score: number; confidence: number } {
    const ruleScore = Math.min(ruleViolations.length * 15, 60); // Max 60 points from rules

    // Weighted combination: 70% AI, 30% rules
    const combinedScore = (aiScore.score * 0.7) + (ruleScore * 0.3);
    const combinedConfidence = aiScore.confidence * 0.8 + 0.2; // Minimum 20% confidence from rules

    return {
      score: Math.round(combinedScore),
      confidence: combinedConfidence
    };
  }

  /**
   * Determine risk level based on score
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.riskThresholds.critical) return 'critical';
    if (score >= this.riskThresholds.high) return 'high';
    if (score >= this.riskThresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Determine recommended action based on score and violations
   */
  private determineAction(score: number, violations: string[]): 'allow' | 'review' | 'block' {
    if (score >= this.riskThresholds.critical || violations.length >= 3) {
      return 'block';
    }
    if (score >= this.riskThresholds.high || violations.length >= 2) {
      return 'review';
    }
    return 'allow';
  }

  /**
   * Report false positive/negative for model improvement
   */
  async reportFeedback(
    transactionId: string,
    actualFraudulent: boolean,
    predictedScore: number
  ): Promise<void> {
    try {
      await axios.post(`${this.aiServiceUrl}/fraud/feedback`, {
        transactionId,
        actualFraudulent,
        predictedScore,
        timestamp: new Date().toISOString()
      });

      logger.info('Fraud detection feedback submitted', { transactionId });
    } catch (error) {
      logger.error('Failed to submit fraud feedback', { transactionId, error: error.message });
    }
  }

  /**
   * Get fraud statistics for monitoring
   */
  async getStatistics(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<{
    totalAnalyzed: number;
    blockedTransactions: number;
    reviewedTransactions: number;
    falsePositives: number;
    falseNegatives: number;
  }> {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/fraud/statistics?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get fraud statistics', { error: error.message });
      return {
        totalAnalyzed: 0,
        blockedTransactions: 0,
        reviewedTransactions: 0,
        falsePositives: 0,
        falseNegatives: 0
      };
    }
  }
}

export default FraudDetectionService;