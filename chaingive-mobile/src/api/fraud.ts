import { apiClient } from './client';

export interface FraudCheckRequest {
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

export interface FraudCheckResult {
  isFraudulent: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  score: number;
  confidence: number;
  reasons: string[];
  recommendedAction: 'approve' | 'review' | 'deny';
  checkId: string;
  timestamp: string;
}

export interface FraudStatistics {
  totalChecks: number;
  fraudulentTransactions: number;
  blockedTransactions: number;
  falsePositives: number;
  detectionAccuracy: number;
  averageResponseTime: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  recentAlerts: Array<{
    id: string;
    userId: string;
    riskLevel: string;
    reason: string;
    timestamp: string;
    status: 'active' | 'acknowledged' | 'resolved';
  }>;
}

export interface UserRiskProfile {
  userId: string;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: Array<{
    factor: string;
    score: number;
    description: string;
  }>;
  recentActivity: Array<{
    type: string;
    riskLevel: string;
    timestamp: string;
  }>;
  recommendations: string[];
  lastUpdated: string;
}

export interface FraudAlert {
  id: string;
  userId: string;
  transactionId?: string;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
  details: any;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

/**
 * Check payment for fraud
 */
export const checkPaymentFraud = async (
  fraudCheck: FraudCheckRequest
): Promise<FraudCheckResult> => {
  const response = await apiClient.post('/fraud/check', fraudCheck);
  return response.data.data;
};

/**
 * Get fraud statistics (admin only)
 */
export const getFraudStatistics = async (
  timeframe: 'day' | 'week' | 'month' = 'month'
): Promise<FraudStatistics> => {
  const response = await apiClient.get(`/fraud/statistics?timeframe=${timeframe}`);
  return response.data.data;
};

/**
 * Report false positive fraud detection
 */
export const reportFalsePositive = async (
  transactionId: string,
  reason?: string
): Promise<void> => {
  await apiClient.post('/fraud/false-positive', { transactionId, reason });
};

/**
 * Get user's fraud risk profile
 */
export const getUserRiskProfile = async (): Promise<UserRiskProfile> => {
  const response = await apiClient.get('/fraud/profile');
  return response.data.data;
};

/**
 * Get fraud alerts for user
 */
export const getFraudAlerts = async (
  acknowledged = false,
  limit = 50
): Promise<{ alerts: FraudAlert[]; total: number }> => {
  const params = new URLSearchParams({
    acknowledged: acknowledged.toString(),
    limit: limit.toString(),
  });

  const response = await apiClient.get(`/fraud/alerts?${params}`);
  return response.data.data;
};

/**
 * Acknowledge fraud alert
 */
export const acknowledgeFraudAlert = async (alertId: string): Promise<void> => {
  await apiClient.put(`/fraud/alerts/${alertId}/acknowledge`);
};