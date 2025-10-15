import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface AIMatch {
  id: string;
  userId: string;
  matchedUserId: string;
  matchScore: number;
  compatibilityFactors: {
    givingHistory: number;
    causesAlignment: number;
    donationFrequency: number;
    locationProximity: number;
    socialActivity: number;
  };
  recommendedAmount: number;
  confidenceLevel: number;
  matchReason: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
}

interface AIPrediction {
  id: string;
  userId: string;
  predictionType: 'donation_amount' | 'optimal_time' | 'cause_preference' | 'engagement_level';
  prediction: any;
  confidence: number;
  factors: string[];
  accuracy?: number; // filled after validation
  createdAt: string;
  validatedAt?: string;
}

interface AIRecommendation {
  id: string;
  userId: string;
  type: 'cause' | 'amount' | 'timing' | 'social' | 'challenge';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  action: {
    type: string;
    payload: any;
  };
  createdAt: string;
  status: 'pending' | 'viewed' | 'acted' | 'dismissed';
}

interface AIInsight {
  id: string;
  userId: string;
  category: 'giving_pattern' | 'social_impact' | 'financial_health' | 'community_fit';
  title: string;
  insight: string;
  data: any;
  actionable: boolean;
  actionTaken?: boolean;
  createdAt: string;
}

interface SmartMatchingProfile {
  userId: string;
  givingPreferences: {
    causes: string[];
    amounts: { min: number; max: number; preferred: number };
    frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
    methods: string[];
  };
  socialProfile: {
    activityLevel: number;
    preferredGroupSize: number;
    leadershipInterest: boolean;
    collaborationStyle: string;
  };
  impactGoals: {
    shortTerm: string[];
    longTerm: string[];
    measurementPreferences: string[];
  };
  lastUpdated: string;
}

interface AIState {
  matches: AIMatch[];
  predictions: AIPrediction[];
  recommendations: AIRecommendation[];
  insights: AIInsight[];
  smartProfile: SmartMatchingProfile | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: AIState = {
  matches: [],
  predictions: [],
  recommendations: [],
  insights: [],
  smartProfile: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchAIMatches = createAsyncThunk(
  'ai/fetchAIMatches',
  async ({ userId, limit = 10 }: { userId: string; limit?: number }) => {
    const response = await fetch(`/api/ai/matches/${userId}?limit=${limit}`);
    return response.json();
  }
);

export const generateAIPredictions = createAsyncThunk(
  'ai/generateAIPredictions',
  async ({ userId, types }: { userId: string; types: string[] }) => {
    const response = await fetch('/api/ai/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, types }),
    });
    return response.json();
  }
);

export const getAIRecommendations = createAsyncThunk(
  'ai/getAIRecommendations',
  async ({ userId, categories }: { userId: string; categories?: string[] }) => {
    const query = categories ? `?categories=${categories.join(',')}` : '';
    const response = await fetch(`/api/ai/recommendations/${userId}${query}`);
    return response.json();
  }
);

export const fetchAIInsights = createAsyncThunk(
  'ai/fetchAIInsights',
  async ({ userId, category }: { userId: string; category?: string }) => {
    const query = category ? `?category=${category}` : '';
    const response = await fetch(`/api/ai/insights/${userId}${query}`);
    return response.json();
  }
);

export const updateAISmartProfile = createAsyncThunk(
  'ai/updateSmartProfile',
  async ({ userId, profile }: { userId: string; profile: Partial<SmartMatchingProfile> }) => {
    const response = await fetch(`/api/ai/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return response.json();
  }
);

export const acceptAIMatch = createAsyncThunk(
  'ai/acceptAIMatch',
  async ({ matchId, userId }: { matchId: string; userId: string }) => {
    const response = await fetch(`/api/ai/matches/${matchId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const actOnRecommendation = createAsyncThunk(
  'ai/actOnRecommendation',
  async ({ recommendationId, userId, action }: {
    recommendationId: string;
    userId: string;
    action: 'view' | 'act' | 'dismiss';
  }) => {
    const response = await fetch(`/api/ai/recommendations/${recommendationId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    });
    return response.json();
  }
);

export const generatePersonalizedChallenge = createAsyncThunk(
  'ai/generatePersonalizedChallenge',
  async ({ userId, preferences }: { userId: string; preferences: any }) => {
    const response = await fetch('/api/ai/challenges/personalized', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, preferences }),
    });
    return response.json();
  }
);

// Slice
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addMatch: (state, action: PayloadAction<AIMatch>) => {
      state.matches.unshift(action.payload);
    },
    updateMatch: (state, action: PayloadAction<AIMatch>) => {
      const index = state.matches.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.matches[index] = action.payload;
      }
    },
    addPrediction: (state, action: PayloadAction<AIPrediction>) => {
      state.predictions.unshift(action.payload);
    },
    addRecommendation: (state, action: PayloadAction<AIRecommendation>) => {
      state.recommendations.unshift(action.payload);
    },
    updateRecommendation: (state, action: PayloadAction<AIRecommendation>) => {
      const index = state.recommendations.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.recommendations[index] = action.payload;
      }
    },
    addInsight: (state, action: PayloadAction<AIInsight>) => {
      state.insights.unshift(action.payload);
    },
    updateSmartProfile: (state, action: PayloadAction<Partial<SmartMatchingProfile>>) => {
      if (state.smartProfile) {
        state.smartProfile = { ...state.smartProfile, ...action.payload };
      }
    },
    clearAIError: (state) => {
      state.error = null;
    },
    resetAIState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch AI matches
    builder
      .addCase(fetchAIMatches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAIMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAIMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch AI matches';
      });

    // Generate AI predictions
    builder
      .addCase(generateAIPredictions.fulfilled, (state, action) => {
        state.predictions = [...action.payload, ...state.predictions];
      });

    // Get AI recommendations
    builder
      .addCase(getAIRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      });

    // Fetch AI insights
    builder
      .addCase(fetchAIInsights.fulfilled, (state, action) => {
        state.insights = action.payload;
      });

    // Update smart profile
    builder
      .addCase(updateAISmartProfile.fulfilled, (state, action) => {
        state.smartProfile = action.payload;
      });

    // Accept AI match
    builder
      .addCase(acceptAIMatch.fulfilled, (state, action) => {
        const match = state.matches.find(m => m.id === action.payload.id);
        if (match) {
          match.status = 'accepted';
        }
      });

    // Act on recommendation
    builder
      .addCase(actOnRecommendation.fulfilled, (state, action) => {
        const recommendation = state.recommendations.find(r => r.id === action.payload.id);
        if (recommendation) {
          recommendation.status = action.payload.status;
        }
      });

    // Generate personalized challenge
    builder
      .addCase(generatePersonalizedChallenge.fulfilled, (state, action) => {
        // Handle personalized challenge generation
        console.log('Personalized challenge generated:', action.payload);
      });
  },
});

export const {
  addMatch,
  updateMatch,
  addPrediction,
  addRecommendation,
  updateRecommendation,
  addInsight,
  updateSmartProfile,
  clearAIError,
  resetAIState,
} = aiSlice.actions;

export default aiSlice.reducer;