import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AnalyticsApi } from '../../api/analytics';
import {
  AnalyticsDashboard,
  DonationHeatmap,
  GivingTrends,
  CoinROI,
  SocialImpactScore,
  AnalyticsFilters
} from '../../types/analytics';

interface AnalyticsState {
  dashboard: AnalyticsDashboard | null;
  heatmap: DonationHeatmap | null;
  trends: GivingTrends | null;
  coinROI: CoinROI | null;
  socialImpact: SocialImpactScore | null;
  loading: boolean;
  error: string | null;
  filters: AnalyticsFilters;
  lastFetched: {
    dashboard: string | null;
    heatmap: string | null;
    trends: string | null;
    coinROI: string | null;
    socialImpact: string | null;
  };
}

const initialState: AnalyticsState = {
  dashboard: null,
  heatmap: null,
  trends: null,
  coinROI: null,
  socialImpact: null,
  loading: false,
  error: null,
  filters: {
    period: '30d'
  },
  lastFetched: {
    dashboard: null,
    heatmap: null,
    trends: null,
    coinROI: null,
    socialImpact: null
  }
};

// Async thunks
export const fetchAnalyticsDashboard = createAsyncThunk(
  'analytics/fetchDashboard',
  async (period: '7d' | '30d' | '90d' | '1y' = '30d') => {
    return await AnalyticsApi.getDashboard(period);
  }
);

export const fetchDonationHeatmap = createAsyncThunk(
  'analytics/fetchHeatmap',
  async (filters?: AnalyticsFilters) => {
    return await AnalyticsApi.getDonationHeatmap(filters);
  }
);

export const fetchGivingTrends = createAsyncThunk(
  'analytics/fetchTrends',
  async (filters?: AnalyticsFilters) => {
    return await AnalyticsApi.getGivingTrends(filters);
  }
);

export const fetchCoinROI = createAsyncThunk(
  'analytics/fetchCoinROI',
  async () => {
    return await AnalyticsApi.getCoinROI();
  }
);

export const fetchSocialImpactScore = createAsyncThunk(
  'analytics/fetchSocialImpact',
  async () => {
    return await AnalyticsApi.getSocialImpactScore();
  }
);

export const exportAnalyticsData = createAsyncThunk(
  'analytics/exportData',
  async ({
    format,
    dataType
  }: {
    format: 'csv' | 'pdf' | 'json';
    dataType: 'donations' | 'marketplace' | 'gamification' | 'social';
  }) => {
    return await AnalyticsApi.exportAnalytics(format, dataType);
  }
);

export const fetchComparativeAnalytics = createAsyncThunk(
  'analytics/fetchComparative',
  async () => {
    return await AnalyticsApi.getComparativeAnalytics();
  }
);

export const fetchPredictiveAnalytics = createAsyncThunk(
  'analytics/fetchPredictive',
  async () => {
    return await AnalyticsApi.getPredictiveAnalytics();
  }
);

export const exportCoinData = createAsyncThunk(
  'analytics/exportCoinData',
  async ({ userId, period }: { userId: string; period: '7d' | '30d' | '90d' | '1y' }) => {
    return await AnalyticsApi.exportCoinData(userId, period);
  }
);

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<AnalyticsFilters>) => {
      state.filters = action.payload;
    },
    clearDashboard: (state) => {
      state.dashboard = null;
    },
    clearHeatmap: (state) => {
      state.heatmap = null;
    },
    clearTrends: (state) => {
      state.trends = null;
    },
    clearCoinROI: (state) => {
      state.coinROI = null;
    },
    clearSocialImpact: (state) => {
      state.socialImpact = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch analytics dashboard
    builder
      .addCase(fetchAnalyticsDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
        state.lastFetched.dashboard = new Date().toISOString();
      })
      .addCase(fetchAnalyticsDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch analytics dashboard';
      })

      // Fetch donation heatmap
      .addCase(fetchDonationHeatmap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonationHeatmap.fulfilled, (state, action) => {
        state.loading = false;
        state.heatmap = action.payload;
        state.lastFetched.heatmap = new Date().toISOString();
      })
      .addCase(fetchDonationHeatmap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch donation heatmap';
      })

      // Fetch giving trends
      .addCase(fetchGivingTrends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGivingTrends.fulfilled, (state, action) => {
        state.loading = false;
        state.trends = action.payload;
        state.lastFetched.trends = new Date().toISOString();
      })
      .addCase(fetchGivingTrends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch giving trends';
      })

      // Fetch coin ROI
      .addCase(fetchCoinROI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoinROI.fulfilled, (state, action) => {
        state.loading = false;
        state.coinROI = action.payload;
        state.lastFetched.coinROI = new Date().toISOString();
      })
      .addCase(fetchCoinROI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch coin ROI';
      })

      // Fetch social impact score
      .addCase(fetchSocialImpactScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocialImpactScore.fulfilled, (state, action) => {
        state.loading = false;
        state.socialImpact = action.payload;
        state.lastFetched.socialImpact = new Date().toISOString();
      })
      .addCase(fetchSocialImpactScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch social impact score';
      })

      // Export analytics data
      .addCase(exportAnalyticsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportAnalyticsData.fulfilled, (state, action) => {
        state.loading = false;
        // Export data is handled by the component
      })
      .addCase(exportAnalyticsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to export analytics data';
      })

      // Fetch comparative analytics
      .addCase(fetchComparativeAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComparativeAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        // Comparative data is handled by the component
      })
      .addCase(fetchComparativeAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comparative analytics';
      })

      // Fetch predictive analytics
      .addCase(fetchPredictiveAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPredictiveAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        // Predictive data is handled by the component
      })
      .addCase(fetchPredictiveAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch predictive analytics';
      })

      // Export coin data
      .addCase(exportCoinData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportCoinData.fulfilled, (state, action) => {
        state.loading = false;
        // Export data is handled by the component
      })
      .addCase(exportCoinData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to export coin data';
      });
  }
});

export const {
  clearError,
  setFilters,
  clearDashboard,
  clearHeatmap,
  clearTrends,
  clearCoinROI,
  clearSocialImpact
} = analyticsSlice.actions;

export default analyticsSlice.reducer;