import { apiClient } from './client';
import {
  AIRecommendation,
  AIInsights,
  DonationRecommendation,
  OptimalTimingSuggestion,
  UserBehaviorAnalysis
} from '../types/ai';

export class AIApi {
  /**
   * Get personalized donation recommendations
   */
  static async getDonationRecommendations(limit: number = 5): Promise<AIRecommendation[]> {
    const response = await apiClient.get(`/ai/recommendations/donations?limit=${limit}`);
    return response.data.data;
  }

  /**
   * Get optimal donation timing suggestions
   */
  static async getOptimalTiming(): Promise<OptimalTimingSuggestion> {
    const response = await apiClient.get('/ai/timing/optimal');
    return response.data.data;
  }

  /**
   * Get user behavior analysis and insights
   */
  static async getUserInsights(): Promise<UserBehaviorAnalysis> {
    const response = await apiClient.get('/ai/insights/user');
    return response.data.data;
  }

  /**
   * Get comprehensive AI insights dashboard
   */
  static async getInsightsDashboard(): Promise<AIInsights> {
    const response = await apiClient.get('/ai/insights/dashboard');
    return response.data.data;
  }

  /**
   * Mark recommendation as viewed
   */
  static async markRecommendationViewed(recommendationId: string): Promise<void> {
    await apiClient.patch(`/ai/recommendations/${recommendationId}/view`);
  }

  /**
   * Mark recommendation as actioned
   */
  static async markRecommendationActioned(recommendationId: string): Promise<void> {
    await apiClient.patch(`/ai/recommendations/${recommendationId}/action`);
  }

  /**
   * Get donation amount suggestions based on user profile
   */
  static async getDonationAmountSuggestions(): Promise<DonationRecommendation[]> {
    const response = await apiClient.get('/ai/recommendations/amounts');
    return response.data.data;
  }

  /**
   * Get recipient matching recommendations
   */
  static async getRecipientRecommendations(limit: number = 3): Promise<AIRecommendation[]> {
    const response = await apiClient.get(`/ai/recommendations/recipients?limit=${limit}`);
    return response.data.data;
  }

  /**
   * Get marketplace item recommendations
   */
  static async getMarketplaceRecommendations(limit: number = 5): Promise<AIRecommendation[]> {
    const response = await apiClient.get(`/ai/recommendations/marketplace?limit=${limit}`);
    return response.data.data;
  }

  /**
   * Get social circle recommendations
   */
  static async getSocialCircleRecommendations(limit: number = 3): Promise<AIRecommendation[]> {
    const response = await apiClient.get(`/ai/recommendations/circles?limit=${limit}`);
    return response.data.data;
  }

  /**
   * Submit user feedback on AI recommendations
   */
  static async submitRecommendationFeedback(
    recommendationId: string,
    feedback: {
      rating: number; // 1-5
      helpful: boolean;
      comments?: string;
    }
  ): Promise<void> {
    await apiClient.post(`/ai/recommendations/${recommendationId}/feedback`, feedback);
  }

  /**
   * Get AI-powered donation impact predictions
   */
  static async getImpactPredictions(amount: number, currency: string): Promise<{
    predictedImpact: string;
    confidence: number;
    similarDonations: number;
  }> {
    const response = await apiClient.get(`/ai/predictions/impact?amount=${amount}&currency=${currency}`);
    return response.data.data;
  }

  /**
   * Get personalized gamification suggestions
   */
  static async getGamificationSuggestions(): Promise<AIRecommendation[]> {
    const response = await apiClient.get('/ai/recommendations/gamification');
    return response.data.data;
  }
}