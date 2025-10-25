import { apiClient } from './client';

export interface ImpactMetrics {
  totalDonated: number;
  peopleHelped: number;
  rankingsPosition: number;
  coinsEarned: number;
  averageDonation: number;
  donationFrequency: number;
  impactScore: number;
  communityRank: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyGoal {
  current: number;
  target: number;
  percentage: number;
  daysLeft: number;
}

export interface ImpactStory {
  id: string;
  recipientName: string;
  message: string;
  category: string;
  amount: number;
  timeAgo: string;
  location: string;
}

export interface UserImpactAnalytics {
  userId: string;
  timeframe: 'week' | 'month' | 'year';
  metrics: ImpactMetrics;
  charts: {
    donationTrend: ChartData;
    categoryBreakdown: CategoryBreakdown[];
    monthlyGoal: MonthlyGoal;
  };
  impactStories: ImpactStory[];
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
    progress?: number;
  }>;
  recommendations: string[];
  lastUpdated: string;
}

export interface AnalyticsExport {
  format: 'pdf' | 'csv' | 'json';
  timeframe: 'week' | 'month' | 'year';
  includeCharts: boolean;
  includeStories: boolean;
}

/**
 * Get user's impact analytics
 */
export const getUserImpactAnalytics = async (
  timeframe: 'week' | 'month' | 'year' = 'month'
): Promise<UserImpactAnalytics> => {
  const response = await apiClient.get(`/analytics/impact?timeframe=${timeframe}`);
  return response.data.data;
};

/**
 * Get donation trend data
 */
export const getDonationTrend = async (
  timeframe: 'week' | 'month' | 'year' = 'month',
  category?: string
): Promise<ChartData> => {
  const params = new URLSearchParams({ timeframe });
  if (category) params.append('category', category);

  const response = await apiClient.get(`/analytics/trends/donations?${params}`);
  return response.data.data;
};

/**
 * Get category breakdown analytics
 */
export const getCategoryBreakdown = async (
  timeframe: 'week' | 'month' | 'year' = 'month'
): Promise<{ breakdown: CategoryBreakdown[]; total: number }> => {
  const response = await apiClient.get(`/analytics/categories/breakdown?timeframe=${timeframe}`);
  return response.data.data;
};

/**
 * Get monthly goal progress
 */
export const getMonthlyGoalProgress = async (): Promise<MonthlyGoal> => {
  const response = await apiClient.get('/analytics/goals/monthly');
  return response.data.data;
};

/**
 * Get impact stories
 */
export const getImpactStories = async (
  limit = 10,
  category?: string
): Promise<{ stories: ImpactStory[]; total: number }> => {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (category) params.append('category', category);

  const response = await apiClient.get(`/analytics/stories?${params}`);
  return response.data.data;
};

/**
 * Get user achievements
 */
export const getUserAchievements = async (): Promise<{
  achievements: UserImpactAnalytics['achievements'];
  total: number;
  unlocked: number;
}> => {
  const response = await apiClient.get('/analytics/achievements');
  return response.data.data;
};

/**
 * Export analytics report
 */
export const exportAnalyticsReport = async (
  exportOptions: AnalyticsExport
): Promise<{ downloadUrl: string; expiresAt: string }> => {
  const response = await apiClient.post('/analytics/export', exportOptions);
  return response.data.data;
};

/**
 * Get personalized recommendations based on analytics
 */
export const getAnalyticsRecommendations = async (): Promise<{
  recommendations: string[];
  insights: Array<{
    type: string;
    message: string;
    action?: string;
  }>;
}> => {
  const response = await apiClient.get('/analytics/recommendations');
  return response.data.data;
};

/**
 * Track user interaction with analytics
 */
export const trackAnalyticsInteraction = async (
  interaction: {
    type: 'view' | 'export' | 'share' | 'filter';
    element: string;
    value?: string;
  }
): Promise<void> => {
  await apiClient.post('/analytics/track', interaction);
};