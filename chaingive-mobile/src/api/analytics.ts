import { apiClient } from './client';
import {
  AnalyticsEvent,
  AnalyticsDashboard,
  DonationHeatmap,
  GivingTrends,
  CoinROI,
  SocialImpactScore,
  AnalyticsFilters
} from '../types/analytics';

export class AnalyticsApi {
  /**
   * Track user analytics event
   */
  static async trackEvent(eventData: {
    eventType: string;
    eventData: Record<string, any>;
    sessionId?: string;
    deviceInfo?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await apiClient.post('/analytics/events', eventData);
  }

  /**
   * Get user analytics dashboard
   */
  static async getDashboard(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsDashboard> {
    const response = await apiClient.get(`/analytics/dashboard?period=${period}`);
    return response.data.data;
  }

  /**
   * Get donation heatmap data
   */
  static async getDonationHeatmap(filters?: AnalyticsFilters): Promise<DonationHeatmap> {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.currency) params.append('currency', filters.currency);

    const response = await apiClient.get(`/analytics/heatmap?${params}`);
    return response.data.data;
  }

  /**
   * Get giving trends data
   */
  static async getGivingTrends(filters?: AnalyticsFilters): Promise<GivingTrends> {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.currency) params.append('currency', filters.currency);

    const response = await apiClient.get(`/analytics/trends?${params}`);
    return response.data.data;
  }

  /**
   * Get coin ROI analysis
   */
  static async getCoinROI(): Promise<CoinROI> {
    const response = await apiClient.get('/analytics/coin-roi');
    return response.data.data;
  }

  /**
   * Get social impact score
   */
  static async getSocialImpactScore(): Promise<SocialImpactScore> {
    const response = await apiClient.get('/analytics/social-impact');
    return response.data.data;
  }

  /**
   * Get donation analytics by category
   */
  static async getDonationAnalytics(category: 'amount' | 'frequency' | 'timing' | 'recipients'): Promise<any> {
    const response = await apiClient.get(`/analytics/donations/${category}`);
    return response.data.data;
  }

  /**
   * Get marketplace analytics
   */
  static async getMarketplaceAnalytics(): Promise<{
    totalRedemptions: number;
    favoriteCategories: string[];
    spendingTrends: {
      period: string;
      amount: number;
      category: string;
    }[];
    redemptionRate: number;
  }> {
    const response = await apiClient.get('/analytics/marketplace');
    return response.data.data;
  }

  /**
   * Get gamification analytics
   */
  static async getGamificationAnalytics(): Promise<{
    currentLevel: number;
    achievementsUnlocked: number;
    streakDays: number;
    coinsEarned: number;
    participationRate: number;
    leaderboardPosition: number;
  }> {
    const response = await apiClient.get('/analytics/gamification');
    return response.data.data;
  }

  /**
   * Export analytics data
   */
  static async exportAnalytics(
    format: 'csv' | 'pdf' | 'json',
    dataType: 'donations' | 'marketplace' | 'gamification' | 'social'
  ): Promise<{ downloadUrl: string; expiresAt: string }> {
    const response = await apiClient.post('/analytics/export', {
      format,
      dataType
    });
    return response.data.data;
  }

  /**
   * Get comparative analytics (vs peers)
   */
  static async getComparativeAnalytics(): Promise<{
    donationRank: number;
    totalUsers: number;
    percentile: number;
    comparedToPeers: {
      metric: string;
      userValue: number;
      peerAverage: number;
      difference: number;
    }[];
  }> {
    const response = await apiClient.get('/analytics/comparative');
    return response.data.data;
  }

  /**
   * Get predictive analytics
   */
  static async getPredictiveAnalytics(): Promise<{
    nextDonationPrediction: {
      predictedDate: string;
      confidence: number;
      factors: string[];
    };
    coinEarningPotential: {
      predictedCoins: number;
      timeframe: string;
      recommendations: string[];
    };
    socialGrowthProjection: {
      predictedConnections: number;
      engagementRate: number;
      tips: string[];
    };
  }> {
    const response = await apiClient.get('/analytics/predictive');
    return response.data.data;
  }
}