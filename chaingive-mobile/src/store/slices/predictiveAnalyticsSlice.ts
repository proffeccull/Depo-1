import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface PredictiveInsight {
  id: string;
  type: 'donation_prediction' | 'giving_streak' | 'coin_optimization' | 'social_impact' | 'achievement_unlock' | 'market_trend';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: 'low' | 'medium' | 'high';
  category: 'giving' | 'social' | 'financial' | 'achievement';
  predictedValue?: number;
  timeFrame: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  actionable: boolean;
  actionLabel?: string;
  actionType?: string;
  createdAt: string;
  expiresAt?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
}

interface GivingPrediction {
  userId: string;
  predictedAmount: number;
  confidence: number;
  factors: PredictionFactor[];
  timeFrame: string;
  lastUpdated: string;
}

interface PredictionFactor {
  factor: string;
  impact: number; // -1 to 1
  weight: number; // 0-1
  description: string;
}

interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  period: '7d' | '30d' | '90d';
  category: string;
  prediction: string;
}

interface CoinOptimization {
  currentBalance: number;
  recommendedActions: OptimizationAction[];
  potentialSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface OptimizationAction {
  action: string;
  potentialGain: number;
  risk: 'low' | 'medium' | 'high';
  timeframe: string;
  description: string;
}

interface SocialRecommendation {
  type: 'circle_join' | 'challenge_participation' | 'friend_connection' | 'giving_pattern';
  targetId?: string;
  targetName?: string;
  reason: string;
  confidence: number;
  potentialImpact: string;
}

interface PredictiveAnalyticsState {
  insights: PredictiveInsight[];
  givingPredictions: GivingPrediction | null;
  trendAnalysis: TrendAnalysis[];
  coinOptimization: CoinOptimization | null;
  socialRecommendations: SocialRecommendation[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  insightsEnabled: boolean;
}

// Initial state
const initialState: PredictiveAnalyticsState = {
  insights: [],
  givingPredictions: null,
  trendAnalysis: [],
  coinOptimization: null,
  socialRecommendations: [],
  loading: false,
  error: null,
  lastUpdated: null,
  insightsEnabled: true,
};

// Async thunks
export const fetchPredictiveInsights = createAsyncThunk(
  'predictiveAnalytics/fetchInsights',
  async (userId: string) => {
    const response = await fetch(`/api/analytics/predictive/insights/${userId}`);
    return response.json();
  }
);

export const fetchGivingPredictions = createAsyncThunk(
  'predictiveAnalytics/fetchGivingPredictions',
  async (userId: string) => {
    const response = await fetch(`/api/analytics/predictive/giving-predictions/${userId}`);
    return response.json();
  }
);

export const fetchTrendAnalysis = createAsyncThunk(
  'predictiveAnalytics/fetchTrendAnalysis',
  async ({ userId, period = '30d' }: { userId: string; period?: string }) => {
    const response = await fetch(`/api/analytics/predictive/trends/${userId}?period=${period}`);
    return response.json();
  }
);

export const fetchCoinOptimization = createAsyncThunk(
  'predictiveAnalytics/fetchCoinOptimization',
  async (userId: string) => {
    const response = await fetch(`/api/analytics/predictive/coin-optimization/${userId}`);
    return response.json();
  }
);

export const fetchSocialRecommendations = createAsyncThunk(
  'predictiveAnalytics/fetchSocialRecommendations',
  async (userId: string) => {
    const response = await fetch(`/api/analytics/predictive/social-recommendations/${userId}`);
    return response.json();
  }
);

export const markInsightAsRead = createAsyncThunk(
  'predictiveAnalytics/markInsightAsRead',
  async ({ insightId, userId }: { insightId: string; userId: string }) => {
    const response = await fetch('/api/analytics/predictive/insights/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ insightId, userId }),
    });
    return response.json();
  }
);

export const generatePersonalizedInsights = createAsyncThunk(
  'predictiveAnalytics/generateInsights',
  async ({ userId, context }: { userId: string; context?: Record<string, any> }) => {
    const response = await fetch('/api/analytics/predictive/generate-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, context }),
    });
    return response.json();
  }
);

export const togglePredictiveInsights = createAsyncThunk(
  'predictiveAnalytics/toggleInsights',
  async ({ enabled, userId }: { enabled: boolean; userId: string }) => {
    const response = await fetch('/api/analytics/predictive/toggle-insights', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, userId }),
    });
    return response.json();
  }
);

// Slice
const predictiveAnalyticsSlice = createSlice({
  name: 'predictiveAnalytics',
  initialState,
  reducers: {
    updateInsight: (state, action: PayloadAction<PredictiveInsight>) => {
      const index = state.insights.findIndex(insight => insight.id === action.payload.id);
      if (index !== -1) {
        state.insights[index] = action.payload;
      }
    },
    addInsight: (state, action: PayloadAction<PredictiveInsight>) => {
      state.insights.unshift(action.payload);
    },
    markInsightRead: (state, action: PayloadAction<string>) => {
      const insight = state.insights.find(i => i.id === action.payload);
      if (insight) {
        insight.isRead = true;
      }
    },
    updateGivingPrediction: (state, action: PayloadAction<GivingPrediction>) => {
      state.givingPredictions = action.payload;
    },
    updateTrendAnalysis: (state, action: PayloadAction<TrendAnalysis[]>) => {
      state.trendAnalysis = action.payload;
    },
    updateCoinOptimization: (state, action: PayloadAction<CoinOptimization>) => {
      state.coinOptimization = action.payload;
    },
    updateSocialRecommendations: (state, action: PayloadAction<SocialRecommendation[]>) => {
      state.socialRecommendations = action.payload;
    },
    clearPredictiveError: (state) => {
      state.error = null;
    },
    resetPredictiveState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch predictive insights
    builder
      .addCase(fetchPredictiveInsights.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPredictiveInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload.insights;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPredictiveInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch predictive insights';
      });

    // Fetch giving predictions
    builder
      .addCase(fetchGivingPredictions.fulfilled, (state, action) => {
        state.givingPredictions = action.payload;
      });

    // Fetch trend analysis
    builder
      .addCase(fetchTrendAnalysis.fulfilled, (state, action) => {
        state.trendAnalysis = action.payload;
      });

    // Fetch coin optimization
    builder
      .addCase(fetchCoinOptimization.fulfilled, (state, action) => {
        state.coinOptimization = action.payload;
      });

    // Fetch social recommendations
    builder
      .addCase(fetchSocialRecommendations.fulfilled, (state, action) => {
        state.socialRecommendations = action.payload;
      });

    // Mark insight as read
    builder
      .addCase(markInsightAsRead.fulfilled, (state, action) => {
        const insight = state.insights.find(i => i.id === action.payload.insightId);
        if (insight) {
          insight.isRead = true;
        }
      });

    // Generate personalized insights
    builder
      .addCase(generatePersonalizedInsights.fulfilled, (state, action) => {
        state.insights.unshift(...action.payload.newInsights);
      });

    // Toggle predictive insights
    builder
      .addCase(togglePredictiveInsights.fulfilled, (state, action) => {
        state.insightsEnabled = action.payload.enabled;
      });
  },
});

export const {
  updateInsight,
  addInsight,
  markInsightRead,
  updateGivingPrediction,
  updateTrendAnalysis,
  updateCoinOptimization,
  updateSocialRecommendations,
  clearPredictiveError,
  resetPredictiveState,
} = predictiveAnalyticsSlice.actions;

export default predictiveAnalyticsSlice.reducer;