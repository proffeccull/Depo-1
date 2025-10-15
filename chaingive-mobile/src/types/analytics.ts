export interface AnalyticsEvent {
  id: string;
  eventType: string;
  eventData: Record<string, any>;
  userId?: string;
  sessionId?: string;
  deviceInfo?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AnalyticsDashboard {
  overview: {
    totalDonations: number;
    totalAmount: number;
    totalCoinsEarned: number;
    currentStreak: number;
    trustScore: number;
    leaderboardRank: number;
  };
  donationMetrics: {
    averageDonation: number;
    largestDonation: number;
    smallestDonation: number;
    mostFrequentDay: string;
    mostFrequentTime: string;
    donationFrequency: string; // 'daily', 'weekly', 'monthly'
  };
  coinMetrics: {
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    earningRate: number; // coins per donation
    roi: number; // return on investment
  };
  socialMetrics: {
    circlesJoined: number;
    postsCreated: number;
    interactionsReceived: number;
    socialScore: number;
  };
  marketplaceMetrics: {
    itemsRedeemed: number;
    totalSpent: number;
    favoriteCategory: string;
    redemptionRate: number;
  };
  trends: {
    donationsOverTime: {
      date: string;
      amount: number;
      count: number;
    }[];
    coinBalanceOverTime: {
      date: string;
      balance: number;
    }[];
    socialEngagementOverTime: {
      date: string;
      posts: number;
      interactions: number;
    }[];
  };
}

export interface DonationHeatmap {
  data: {
    day: string;
    hour: number;
    intensity: number; // 0-1 scale
    donationCount: number;
    totalAmount: number;
  }[];
  summary: {
    peakDay: string;
    peakHour: number;
    averageIntensity: number;
    totalDonations: number;
  };
}

export interface GivingTrends {
  monthlyTrends: {
    month: string;
    donations: number;
    amount: number;
    coinsEarned: number;
    growth: number; // percentage change from previous month
  }[];
  seasonalPatterns: {
    season: string;
    averageDonations: number;
    averageAmount: number;
    peakMonth: string;
  }[];
  yearOverYear: {
    year: string;
    totalDonations: number;
    totalAmount: number;
    growthRate: number;
  }[];
  predictions: {
    nextMonthPrediction: number;
    confidence: number;
    factors: string[];
  };
}

export interface CoinROI {
  totalInvested: number;
  totalEarned: number;
  netReturn: number;
  roiPercentage: number;
  breakEvenPoint: string; // date when ROI became positive
  earningSources: {
    source: string;
    amount: number;
    percentage: number;
  }[];
  spendingBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  projections: {
    monthsToBreakEven: number;
    projectedROI: number;
    recommendedActions: string[];
  };
}

export interface SocialImpactScore {
  overallScore: number; // 0-100
  components: {
    donationImpact: {
      score: number;
      peopleHelped: number;
      communitiesSupported: number;
      multiplier: number;
    };
    socialEngagement: {
      score: number;
      connectionsMade: number;
      postsCreated: number;
      interactionsGenerated: number;
    };
    leadership: {
      score: number;
      peopleInspired: number;
      circlesCreated: number;
      mentorshipGiven: number;
    };
    sustainability: {
      score: number;
      consistentGiving: number;
      longTermCommitment: number;
      rippleEffect: number;
    };
  };
  achievements: {
    name: string;
    description: string;
    unlockedAt: string;
    impact: string;
  }[];
  nextMilestones: {
    milestone: string;
    currentProgress: number;
    target: number;
    estimatedDate: string;
  }[];
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  currency?: string;
  category?: string;
  period?: '7d' | '30d' | '90d' | '1y' | 'all';
}