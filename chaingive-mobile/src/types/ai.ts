export interface AIRecommendation {
  id: string;
  userId: string;
  recommendationType: 'donation_amount' | 'recipient' | 'marketplace_item' | 'social_circle' | 'gamification' | 'timing';
  recommendationData: {
    title: string;
    description: string;
    actionText: string;
    metadata: Record<string, any>;
  };
  confidenceScore: number; // 0-1
  isViewed: boolean;
  isActioned: boolean;
  createdAt: string;
  viewedAt?: string;
  actionedAt?: string;
}

export interface AIInsights {
  userId: string;
  donationPatterns: {
    averageAmount: number;
    frequency: string; // 'weekly', 'monthly', 'irregular'
    preferredCurrency: string;
    peakDonationDays: string[];
    seasonalTrends: {
      month: string;
      donationCount: number;
      averageAmount: number;
    }[];
  };
  socialEngagement: {
    circleParticipation: number;
    postInteractions: number;
    leaderboardPosition: number;
    socialScore: number;
  };
  gamificationProgress: {
    currentLevel: number;
    achievementsUnlocked: number;
    streakDays: number;
    coinsEarned: number;
  };
  marketplaceActivity: {
    itemsRedeemed: number;
    favoriteCategories: string[];
    spendingPatterns: {
      category: string;
      totalSpent: number;
      frequency: number;
    }[];
  };
  predictions: {
    nextDonationDate: string;
    suggestedAmount: number;
    confidence: number;
  };
  recommendations: AIRecommendation[];
}

export interface DonationRecommendation {
  amount: number;
  currency: string;
  reasoning: string;
  confidence: number;
  expectedImpact: string;
}

export interface OptimalTimingSuggestion {
  bestDayOfWeek: string;
  bestTimeOfDay: string;
  reasoning: string;
  confidence: number;
  alternativeTimes: {
    day: string;
    time: string;
    score: number;
  }[];
}

export interface UserBehaviorAnalysis {
  donationBehavior: {
    consistencyScore: number; // 0-100
    generosityIndex: number; // 0-100
    socialImpact: number; // 0-100
    riskProfile: 'conservative' | 'moderate' | 'adventurous';
  };
  engagementMetrics: {
    appUsageFrequency: string;
    featureAdoption: string[];
    interactionPatterns: {
      feature: string;
      usageCount: number;
      lastUsed: string;
    }[];
  };
  socialBehavior: {
    networkSize: number;
    influenceScore: number;
    collaborationIndex: number;
  };
  financialHabits: {
    budgetAdherence: number;
    savingPatterns: string;
    investmentReadiness: number;
  };
  recommendations: {
    immediateActions: string[];
    longTermGoals: string[];
    personalizedTips: string[];
  };
}