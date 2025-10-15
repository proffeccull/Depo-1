import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, API_ENDPOINTS, handleApiError } from '../../services/api';

// Types
interface UserAnalytics {
  userId: string;
  sessionCount: number;
  totalSessionTime: number;
  averageSessionTime: number;
  lastActive: string;
  deviceInfo: {
    platform: string;
    version: string;
    model: string;
  };
  locationData: {
    country: string;
    city: string;
  };
  coinMetrics: {
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    averageDailyEarnings: number;
    spendingRate: number;
  };
  donationMetrics: {
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    donationFrequency: number;
    causesSupported: number;
  };
  socialMetrics: {
    referralsSent: number;
    referralsConverted: number;
    conversionRate: number;
    socialInteractions: number;
  };
  gamificationMetrics: {
    achievementsUnlocked: number;
    totalXP: number;
    currentLevel: number;
    streakData: {
      currentStreak: number;
      longestStreak: number;
      averageStreak: number;
    };
  };
}

interface AdvancedAnalytics {
  predictiveInsights: {
    optimalDonationTimes: string[];
    bestCauses: string[];
    expectedEarnings: number;
    riskFactors: string[];
  };
  roiAnalysis: {
    totalInvested: number;
    totalImpact: number;
    roiPercentage: number;
    projectedValue: number;
  };
  trendAnalysis: {
    monthlyGrowth: number;
    seasonalPatterns: Record<string, number>;
    peerComparison: {
      percentile: number;
      topPerformers: number;
    };
  };
  personalizedRecommendations: {
    suggestedActions: string[];
    priorityCauses: string[];
    optimizationTips: string[];
  };
}

interface AnalyticsState {
  userAnalytics: UserAnalytics | null;
  advancedAnalytics: AdvancedAnalytics | null;
  analytics: Record<string, any>;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: AnalyticsState = {
  userAnalytics: null,
  advancedAnalytics: null,
  analytics: {},
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchUserAnalytics = createAsyncThunk(
  'analytics/fetchUserAnalytics',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/analytics`);
    return response.json();
  }
);

export const fetchAdvancedAnalytics = createAsyncThunk(
  'analytics/fetchAdvancedAnalytics',
  async ({ userId, timeframe }: { userId: string; timeframe: string }) => {
    const response = await fetch(`/api/users/${userId}/analytics/advanced?timeframe=${timeframe}`);
    return response.json();
  }
);

export const trackEvent = createAsyncThunk(
  'analytics/trackEvent',
  async ({ userId, eventType, eventData }: {
    userId: string;
    eventType: string;
    eventData: any;
  }) => {
    const response = await fetch(`/api/users/${userId}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, eventData, timestamp: new Date().toISOString() }),
    });
    return response.json();
  }
);

export const trackCoinTransaction = createAsyncThunk(
  'analytics/trackCoinTransaction',
  async ({ userId, transaction }: { userId: string; transaction: any }) => {
    const response = await fetch(`/api/users/${userId}/analytics/coin-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    return response.json();
  }
);

export const trackAchievementUnlock = createAsyncThunk(
  'analytics/trackAchievementUnlock',
  async ({ userId, achievement }: { userId: string; achievement: any }) => {
    const response = await fetch(`/api/users/${userId}/analytics/achievement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achievement),
    });
    return response.json();
  }
);

export const exportCoinData = createAsyncThunk(
  'analytics/exportCoinData',
  async ({ userId, period }: { userId: string; period: string }, { rejectWithValue }) => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANALYTICS.COIN_DATA_EXPORT.replace(':userId', userId),
      { period, format: 'csv' }
    );

    if (!response.success) {
      return rejectWithValue(handleApiError(response.error || 'Failed to export coin data'));
    }

    return response.data;
  }
);

export const exportAnalyticsReport = createAsyncThunk(
  'analytics/exportReport',
  async ({ userId, format, timeframe }: {
    userId: string;
    format: 'pdf' | 'csv';
    timeframe: string;
  }) => {
    const response = await fetch(`/api/users/${userId}/analytics/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, timeframe }),
    });
    return response.json();
  }
);

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    updateAnalytics: (state, action: PayloadAction<Record<string, any>>) => {
      state.analytics = { ...state.analytics, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    resetAnalyticsState: () => initialState,
    updateUserMetrics: (state, action: PayloadAction<Partial<UserAnalytics>>) => {
      if (state.userAnalytics) {
        state.userAnalytics = { ...state.userAnalytics, ...action.payload };
      }
    },
    updateAdvancedMetrics: (state, action: PayloadAction<Partial<AdvancedAnalytics>>) => {
      if (state.advancedAnalytics) {
        state.advancedAnalytics = { ...state.advancedAnalytics, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch user analytics
    builder
      .addCase(fetchUserAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.userAnalytics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      });

    // Fetch advanced analytics
    builder
      .addCase(fetchAdvancedAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdvancedAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.advancedAnalytics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAdvancedAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch advanced analytics';
      });

    // Track event
    builder
      .addCase(trackEvent.fulfilled, (state, action) => {
        // Update local analytics state
        state.analytics = { ...state.analytics, ...action.payload };
      });

    // Track coin transaction
    builder
      .addCase(trackCoinTransaction.fulfilled, (state, action) => {
        if (state.userAnalytics?.coinMetrics) {
          state.userAnalytics.coinMetrics = {
            ...state.userAnalytics.coinMetrics,
            ...action.payload,
          };
        }
      });

    // Track achievement unlock
    builder
      .addCase(trackAchievementUnlock.fulfilled, (state, action) => {
        if (state.userAnalytics?.gamificationMetrics) {
          state.userAnalytics.gamificationMetrics = {
            ...state.userAnalytics.gamificationMetrics,
            ...action.payload,
          };
        }
      });

    // Export coin data
    builder
      .addCase(exportCoinData.fulfilled, (state, action) => {
        // Handle export success (could trigger download or show success message)
        console.log('Coin data exported:', action.payload);
      })
      .addCase(exportCoinData.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to export coin data';
      });

    // Export report
    builder
      .addCase(exportAnalyticsReport.fulfilled, (state, action) => {
        // Handle export success (could trigger download or show success message)
        console.log('Analytics report exported:', action.payload);
      });
  },
});

export const {
  updateAnalytics,
  clearAnalyticsError,
  resetAnalyticsState,
  updateUserMetrics,
  updateAdvancedMetrics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;