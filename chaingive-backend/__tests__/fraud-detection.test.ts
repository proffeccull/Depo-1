import { FraudDetectionService } from '../src/services/fraudDetection.service';
import prisma from '../src/utils/prisma';

// Mock Prisma
jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    fraudAlert: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Fraud Detection Service', () => {
  let fraudService: FraudDetectionService;

  beforeEach(() => {
    jest.clearAllMocks();
    fraudService = new FraudDetectionService(prisma);
  });

  describe('checkPaymentFraud', () => {
    it('should detect high-risk transaction', async () => {
      const fraudCheck = {
        userId: 'user-1',
        amount: 50000, // Large amount
        currency: 'NGN',
        gateway: 'flutterwave',
        location: { country: 'NG', city: 'Lagos' },
      };

      // Mock user with low trust score and new account
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        trustScore: 0.2,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day old
      });

      // Mock recent transactions (high frequency)
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([
        { id: 'tx-1', amount: 10000, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
        { id: 'tx-2', amount: 15000, createdAt: new Date(Date.now() - 15 * 60 * 1000) },
      ]);

      const result = await fraudService.checkPaymentFraud(fraudCheck);

      expect(result.isFraudulent).toBe(true);
      expect(result.riskLevel).toBe('high');
      expect(result.reasons).toContain('Amount significantly higher than average');
      expect(result.reasons).toContain('High transaction frequency in short time');
    });

    it('should approve low-risk transaction', async () => {
      const fraudCheck = {
        userId: 'user-1',
        amount: 5000, // Normal amount
        currency: 'NGN',
        gateway: 'flutterwave',
        location: { country: 'NG', city: 'Lagos' },
      };

      // Mock user with good trust score and established account
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        trustScore: 0.9,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year old
      });

      // Mock normal transaction history
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([
        { id: 'tx-1', amount: 3000, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { id: 'tx-2', amount: 4000, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      ]);

      const result = await fraudService.checkPaymentFraud(fraudCheck);

      expect(result.isFraudulent).toBe(false);
      expect(result.riskLevel).toBe('low');
      expect(result.recommendedAction).toBe('approve');
    });

    it('should flag unusual location', async () => {
      const fraudCheck = {
        userId: 'user-1',
        amount: 10000,
        currency: 'NGN',
        gateway: 'flutterwave',
        location: { country: 'US', city: 'New York' }, // Different from usual location
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        trustScore: 0.8,
        locationCity: 'Lagos', // Usual location
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      });

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      const result = await fraudService.checkPaymentFraud(fraudCheck);

      expect(result.riskLevel).toBe('medium');
      expect(result.reasons).toContain('Transaction from different location');
    });
  });

  describe('Anomaly Detection', () => {
    it('should detect amount anomalies', () => {
      const features = {
        amount: 50000,
        amountToAverageRatio: 5.0, // 5x average
        transactionsInLastHour: 1,
        timeOfDay: 14,
        locationChanged: false,
        deviceChanged: false,
        accountAgeDays: 365,
      };

      const result = (fraudService as any).detectAnomaliesRuleBased(features);

      expect(result.isAnomaly).toBe(true);
      expect(result.score).toBeGreaterThan(0.4);
      expect(result.reasons).toContain('Amount significantly higher than average');
    });

    it('should detect frequency anomalies', () => {
      const features = {
        amount: 5000,
        amountToAverageRatio: 1.0,
        transactionsInLastHour: 6, // Very high frequency
        timeOfDay: 14,
        locationChanged: false,
        deviceChanged: false,
        accountAgeDays: 365,
      };

      const result = (fraudService as any).detectAnomaliesRuleBased(features);

      expect(result.isAnomaly).toBe(true);
      expect(result.reasons).toContain('High transaction frequency in short time');
    });

    it('should detect time-based anomalies', () => {
      const features = {
        amount: 10000,
        amountToAverageRatio: 1.0,
        transactionsInLastHour: 1,
        timeOfDay: 3, // Unusual hour (3 AM)
        locationChanged: false,
        deviceChanged: false,
        accountAgeDays: 365,
      };

      const result = (fraudService as any).detectAnomaliesRuleBased(features);

      expect(result.isAnomaly).toBe(true);
      expect(result.reasons).toContain('Unusual transaction time');
    });
  });

  describe('Risk Scoring', () => {
    it('should convert scores to risk levels correctly', () => {
      expect((fraudService as any).scoreToRiskLevel(0.8)).toBe('high');
      expect((fraudService as any).scoreToRiskLevel(0.6)).toBe('high');
      expect((fraudService as any).scoreToRiskLevel(0.5)).toBe('medium');
      expect((fraudService as any).scoreToRiskLevel(0.3)).toBe('low');
      expect((fraudService as any).scoreToRiskLevel(0.1)).toBe('low');
    });
  });

  describe('False Positive Reporting', () => {
    it('should record false positive reports', async () => {
      const userId = 'user-1';
      const transactionId = 'tx-1';
      const reason = 'Legitimate large purchase';

      (prisma.fraudAlert.findMany as jest.Mock).mockResolvedValue([
        { id: 'alert-1', transactionId: 'tx-1' },
      ]);

      await fraudService.reportFalsePositive(userId, transactionId, reason);

      expect(prisma.fraudAlert.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'alert-1' },
          data: expect.objectContaining({
            status: 'resolved',
            falsePositive: true,
            resolutionNotes: reason,
          }),
        })
      );
    });
  });
});