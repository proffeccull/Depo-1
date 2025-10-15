import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AIApi } from '../../api/ai';
import {
  AIRecommendation,
  AIInsights,
  DonationRecommendation,
  OptimalTimingSuggestion,
  UserBehaviorAnalysis
} from '../../types/ai';

interface AIState {
  recommendations: AIRecommendation[];
  insights: AIInsights | null;
  optimalTiming: OptimalTimingSuggestion | null;
  userAnalysis: UserBehaviorAnalysis | null;
  loading: boolean;
  error: string | null;
  lastFetched: {
    recommendations: string | null;
    insights: string | null;
    timing: string | null;
    analysis: string | null;
  };
}

const initialState: AIState = {
  recommendations: [],
  insights: null,
  optimalTiming: null,
  userAnalysis: null,
  loading: false,
  error: null,
  lastFetched: {
    recommendations: null,
    insights: null,
    timing: null,
    analysis: null
  }
};

// Async thunks
export const fetchDonationRecommendations = createAsyncThunk(
  'ai/fetchDonationRecommendations',
  async (limit: number = 5) => {
    return await AIApi.getDonationRecommendations(limit);
  }
);

export const fetchOptimalTiming = createAsyncThunk(
  'ai/fetchOptimalTiming',
  async () => {
    return await AIApi.getOptimalTiming();
  }
);

export const fetchUserInsights = createAsyncThunk(
  'ai/fetchUserInsights',
  async () => {
    return await AIApi.getUserInsights();
  }
);

export const fetchInsightsDashboard = createAsyncThunk(
  'ai/fetchInsightsDashboard',
  async () => {
    return await AIApi.getInsightsDashboard();
  }
);

export const markRecommendationViewed = createAsyncThunk(
  'ai/markRecommendationViewed',
  async (recommendationId: string) => {
    await AIApi.markRecommendationViewed(recommendationId);
    return recommendationId;
  }
);

export const markRecommendationActioned = createAsyncThunk(
  'ai/markRecommendationActioned',
  async (recommendationId: string) => {
    await AIApi.markRecommendationActioned(recommendationId);
    return recommendationId;
  }
);

export const getDonationAmountSuggestions = createAsyncThunk(
  'ai/getDonationAmountSuggestions',
  async () => {
    return await AIApi.getDonationAmountSuggestions();
  }
);

export const getRecipientRecommendations = createAsyncThunk(
  'ai/getRecipientRecommendations',
  async (limit: number = 3) => {
    return await AIApi.getRecipientRecommendations(limit);
  }
);

export const getMarketplaceRecommendations = createAsyncThunk(
  'ai/getMarketplaceRecommendations',
  async (limit: number = 5) => {
    return await AIApi.getMarketplaceRecommendations(limit);
  }
);

export const getSocialCircleRecommendations = createAsyncThunk(
  'ai/getSocialCircleRecommendations',
  async (limit: number = 3) => {
    return await AIApi.getSocialCircleRecommendations(limit);
  }
);

export const submitRecommendationFeedback = createAsyncThunk(
  'ai/submitRecommendationFeedback',
  async ({
    recommendationId,
    feedback
  }: {
    recommendationId: string;
    feedback: {
      rating: number;
      helpful: boolean;
      comments?: string;
    };
  }) => {
    await AIApi.submitRecommendationFeedback(recommendationId, feedback);
    return { recommendationId, feedback };
  }
);

export const getImpactPredictions = createAsyncThunk(
  'ai/getImpactPredictions',
  async ({ amount, currency }: { amount: number; currency: string }) => {
    return await AIApi.getImpactPredictions(amount, currency);
  }
);

export const getGamificationSuggestions = createAsyncThunk(
  'ai/getGamificationSuggestions',
  async () => {
    return await AIApi.getGamificationSuggestions();
  }
);

// Slice
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRecommendations: (state) => {
      state.recommendations = [];
    },
    clearInsights: (state) => {
      state.insights = null;
    },
    clearOptimalTiming: (state) => {
      state.optimalTiming = null;
    },
    clearUserAnalysis: (state) => {
      state.userAnalysis = null;
    },
    updateRecommendationLocally: (state, action: PayloadAction<{ id: string; updates: Partial<AIRecommendation> }>) => {
      const { id, updates } = action.payload;
      const index = state.recommendations.findIndex(rec => rec.id === id);
      if (index !== -1) {
        state.recommendations[index] = { ...state.recommendations[index], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch donation recommendations
    builder
      .addCase(fetchDonationRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonationRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
        state.lastFetched.recommendations = new Date().toISOString();
      })
      .addCase(fetchDonationRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch donation recommendations';
      })

      // Fetch optimal timing
      .addCase(fetchOptimalTiming.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOptimalTiming.fulfilled, (state, action) => {
        state.loading = false;
        state.optimalTiming = action.payload;
        state.lastFetched.timing = new Date().toISOString();
      })
      .addCase(fetchOptimalTiming.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch optimal timing';
      })

      // Fetch user insights
      .addCase(fetchUserInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.userAnalysis = action.payload;
        state.lastFetched.analysis = new Date().toISOString();
      })
      .addCase(fetchUserInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user insights';
      })

      // Fetch insights dashboard
      .addCase(fetchInsightsDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInsightsDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
        state.lastFetched.insights = new Date().toISOString();
      })
      .addCase(fetchInsightsDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch insights dashboard';
      })

      // Mark recommendation viewed
      .addCase(markRecommendationViewed.fulfilled, (state, action) => {
        const index = state.recommendations.findIndex(rec => rec.id === action.payload);
        if (index !== -1) {
          state.recommendations[index].isViewed = true;
          state.recommendations[index].viewedAt = new Date().toISOString();
        }
      })

      // Mark recommendation actioned
      .addCase(markRecommendationActioned.fulfilled, (state, action) => {
        const index = state.recommendations.findIndex(rec => rec.id === action.payload);
        if (index !== -1) {
          state.recommendations[index].isActioned = true;
          state.recommendations[index].actionedAt = new Date().toISOString();
        }
      })

      // Get donation amount suggestions
      .addCase(getDonationAmountSuggestions.fulfilled, (state, action) => {
        // Handle donation amount suggestions if needed
      })

      // Get recipient recommendations
      .addCase(getRecipientRecommendations.fulfilled, (state, action) => {
        // Merge with existing recommendations
        const newRecs = action.payload.filter(newRec =>
          !state.recommendations.some(existing => existing.id === newRec.id)
        );
        state.recommendations.push(...newRecs);
      })

      // Get marketplace recommendations
      .addCase(getMarketplaceRecommendations.fulfilled, (state, action) => {
        // Merge with existing recommendations
        const newRecs = action.payload.filter(newRec =>
          !state.recommendations.some(existing => existing.id === newRec.id)
        );
        state.recommendations.push(...newRecs);
      })

      // Get social circle recommendations
      .addCase(getSocialCircleRecommendations.fulfilled, (state, action) => {
        // Merge with existing recommendations
        const newRecs = action.payload.filter(newRec =>
          !state.recommendations.some(existing => existing.id === newRec.id)
        );
        state.recommendations.push(...newRecs);
      })

      // Submit recommendation feedback
      .addCase(submitRecommendationFeedback.fulfilled, (state, action) => {
        // Feedback submitted successfully
      })

      // Get gamification suggestions
      .addCase(getGamificationSuggestions.fulfilled, (state, action) => {
        // Merge with existing recommendations
        const newRecs = action.payload.filter(newRec =>
          !state.recommendations.some(existing => existing.id === newRec.id)
        );
        state.recommendations.push(...newRecs);
      });
  }
});

export const {
  clearError,
  clearRecommendations,
  clearInsights,
  clearOptimalTiming,
  clearUserAnalysis,
  updateRecommendationLocally
} = aiSlice.actions;

export default aiSlice.reducer;