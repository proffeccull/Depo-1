import { apiClient } from './client';

export interface MarketplaceRecommendation {
  itemId: string;
  score: number;
  reason: string;
  category: string;
  confidence: number;
  item: {
    id: string;
    name: string;
    description: string;
    category: string;
    coinPrice: number;
    realValue: number;
    imageUrl?: string;
    stockQuantity: number;
    salesCount: number;
  } | null;
}

export interface MarketplaceAnalytics {
  totalRevenue: number;
  topCategories: Array<{
    category: string;
    revenue: number;
    transactions: number;
  }>;
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  trendingItems: Array<{
    itemId: string;
    name: string;
    category: string;
    trendScore: number;
    growthRate: number;
    item: {
      id: string;
      name: string;
      description: string;
      category: string;
      coinPrice: number;
      realValue: number;
      imageUrl?: string;
      stockQuantity: number;
      salesCount: number;
    } | null;
  }>;
  categoryPerformance: Array<{
    category: string;
    revenue: number;
    growth: number;
    userSatisfaction: number;
  }>;
}

export interface CategorySuggestion {
  category: string;
  potentialRevenue: number;
  userDemand: number;
  competition: number;
  recommendation: string;
}

export interface UserMarketplaceInsights {
  insights: {
    totalPurchases: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteCategory: string | null;
    currentCoinBalance: number;
  };
  recentPurchases: Array<{
    id: string;
    item: {
      id: string;
      name: string;
      category: string;
      coinPrice: number;
    };
    totalPrice: number;
    createdAt: string;
  }>;
  recommendations: number;
}

export interface SearchSuggestions {
  trending: string[];
  categories: Array<{
    name: string;
    type: string;
    count: number;
  }>;
  items: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    type: string;
  }>;
}

export interface RecommendationFeedback {
  itemId: string;
  action: 'view' | 'purchase' | 'cart_add' | 'cart_remove';
  rating?: number;
}

/**
 * Get personalized marketplace recommendations
 */
export const getPersonalizedRecommendations = async (
  limit = 10,
  category?: string,
  priceMin?: number,
  priceMax?: number
): Promise<{ recommendations: MarketplaceRecommendation[]; total: number }> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  if (category) params.append('category', category);
  if (priceMin) params.append('priceMin', priceMin.toString());
  if (priceMax) params.append('priceMax', priceMax.toString());

  const response = await apiClient.get(`/marketplace/recommendations?${params}`);
  return response.data.data;
};

/**
 * Get marketplace analytics and insights
 */
export const getMarketplaceAnalytics = async (
  timeframe: 'day' | 'week' | 'month' = 'month'
): Promise<MarketplaceAnalytics> => {
  const response = await apiClient.get(`/marketplace/analytics?timeframe=${timeframe}`);
  return response.data.data;
};

/**
 * Get suggested new categories based on analytics
 */
export const getSuggestedCategories = async (): Promise<{
  suggestions: CategorySuggestion[];
  total: number;
}> => {
  const response = await apiClient.get('/marketplace/analytics/suggestions');
  return response.data.data;
};

/**
 * Update recommendations based on user interaction
 */
export const updateRecommendationFeedback = async (
  feedback: RecommendationFeedback
): Promise<{ message: string }> => {
  const response = await apiClient.post('/marketplace/feedback', feedback);
  return response.data;
};

/**
 * Get trending items based on analytics
 */
export const getTrendingItems = async (
  limit = 20,
  timeframe: 'day' | 'week' | 'month' = 'week'
): Promise<{
  trendingItems: MarketplaceAnalytics['trendingItems'];
  timeframe: string;
  total: number;
}> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    timeframe,
  });

  const response = await apiClient.get(`/marketplace/analytics/trending?${params}`);
  return response.data.data;
};

/**
 * Get category performance analytics
 */
export const getCategoryPerformance = async (
  timeframe: 'day' | 'week' | 'month' = 'month'
): Promise<{
  categoryPerformance: MarketplaceAnalytics['categoryPerformance'];
  timeframe: string;
  totalCategories: number;
}> => {
  const response = await apiClient.get(`/marketplace/analytics/categories?timeframe=${timeframe}`);
  return response.data.data;
};

/**
 * Get user-specific marketplace insights
 */
export const getUserMarketplaceInsights = async (): Promise<UserMarketplaceInsights> => {
  const response = await apiClient.get('/marketplace/insights');
  return response.data.data;
};

/**
 * Get marketplace search suggestions
 */
export const getSearchSuggestions = async (
  query: string,
  limit = 10
): Promise<{ suggestions: SearchSuggestions }> => {
  const params = new URLSearchParams({
    query,
    limit: limit.toString(),
  });

  const response = await apiClient.get(`/marketplace/search/suggestions?${params}`);
  return response.data.data;
};