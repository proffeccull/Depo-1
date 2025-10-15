import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, API_ENDPOINTS, handleApiError } from '../../services/api';

// Types
export interface WeeklyTarget {
  id: string;
  userId: string;
  weekStart: string; // ISO date string for Monday of the week
  weekEnd: string; // ISO date string for Sunday of the week
  targets: TargetItem[];
  totalTargetAmount: number;
  currentAmount: number;
  progress: number;
  status: 'active' | 'completed' | 'failed';
  rewardCoins: number;
  bonusReward: number; // Additional reward for exceeding target
  isBonusAchieved: boolean;
  generatedByAI: boolean;
  aiInsights?: AIInsights;
  createdAt: string;
  updatedAt: string;
}

export interface TargetItem {
  id: string;
  categoryId: string;
  categoryName: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
  description: string;
  tips: string[];
}

export interface AIInsights {
  userBehavior: {
    averageDonation: number;
    preferredCategories: string[];
    donationFrequency: number;
    peakDays: string[];
    seasonalTrends: string[];
  };
  recommendations: {
    suggestedAmount: number;
    reasoning: string;
    confidence: number;
    alternativeTargets: TargetItem[];
  };
  predictions: {
    completionProbability: number;
    estimatedCompletionDate: string;
    riskFactors: string[];
  };
  personalization: {
    motivationStyle: 'achievement' | 'social' | 'impact' | 'competition';
    preferredChallenges: string[];
    optimalTiming: string[];
  };
}

export interface WeeklyTargetStats {
  userId: string;
  totalWeeks: number;
  completedWeeks: number;
  averageProgress: number;
  bestWeek: {
    weekStart: string;
    amount: number;
    targetsCompleted: number;
  };
  currentStreak: number;
  longestStreak: number;
  totalEarnedCoins: number;
  favoriteCategory: string;
  improvementAreas: string[];
}

export interface WeeklyTargetLeaderboard {
  weekStart: string;
  entries: WeeklyTargetLeaderboardEntry[];
  totalParticipants: number;
  lastUpdated: string;
}

export interface WeeklyTargetLeaderboardEntry {
  userId: string;
  userName: string;
  totalAmount: number;
  targetsCompleted: number;
  progress: number;
  rank: number;
  change: number;
  badges: string[];
}

interface WeeklyTargetsState {
  currentTarget: WeeklyTarget | null;
  pastTargets: WeeklyTarget[];
  targetStats: WeeklyTargetStats | null;
  leaderboard: WeeklyTargetLeaderboard | null;
  aiSuggestions: TargetItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: WeeklyTargetsState = {
  currentTarget: null,
  pastTargets: [],
  targetStats: null,
  leaderboard: null,
  aiSuggestions: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchCurrentWeeklyTarget = createAsyncThunk(
  'weeklyTargets/fetchCurrent',
  async (userId: string) => {
    const response = await fetch(`/api/weekly-targets/users/${userId}/current`);
    return response.json();
  }
);

export const generateWeeklyTarget = createAsyncThunk(
  'weeklyTargets/generate',
  async ({ userId, preferences }: {
    userId: string;
    preferences?: {
      focusCategories?: string[];
      difficulty?: 'easy' | 'medium' | 'hard';
      targetAmount?: number;
      includeAI?: boolean;
    };
  }) => {
    const response = await fetch('/api/weekly-targets/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, preferences }),
    });
    return response.json();
  }
);

export const updateTargetProgress = createAsyncThunk(
  'weeklyTargets/updateProgress',
  async ({ targetId, categoryId, amount, userId }: {
    targetId: string;
    categoryId: string;
    amount: number;
    userId: string;
  }) => {
    const response = await fetch(`/api/weekly-targets/${targetId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, amount, userId }),
    });
    return response.json();
  }
);

export const completeWeeklyTarget = createAsyncThunk(
  'weeklyTargets/complete',
  async ({ targetId, userId }: { targetId: string; userId: string }) => {
    const response = await fetch(`/api/weekly-targets/${targetId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const fetchWeeklyTargetStats = createAsyncThunk(
  'weeklyTargets/fetchStats',
  async (userId: string) => {
    const response = await fetch(`/api/weekly-targets/users/${userId}/stats`);
    return response.json();
  }
);

export const fetchWeeklyTargetLeaderboard = createAsyncThunk(
  'weeklyTargets/fetchLeaderboard',
  async (weekStart?: string) => {
    const params = weekStart ? `?weekStart=${weekStart}` : '';
    const response = await fetch(`/api/weekly-targets/leaderboard${params}`);
    return response.json();
  }
);

export const customizeWeeklyTarget = createAsyncThunk(
  'weeklyTargets/customize',
  async ({ targetId, customizations, userId }: {
    targetId: string;
    customizations: {
      adjustAmounts?: { [categoryId: string]: number };
      addCategories?: string[];
      removeCategories?: string[];
      changeDifficulty?: 'easy' | 'medium' | 'hard';
    };
    userId: string;
  }) => {
    const response = await fetch(`/api/weekly-targets/${targetId}/customize`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customizations, userId }),
    });
    return response.json();
  }
);

export const getAISuggestions = createAsyncThunk(
  'weeklyTargets/getAISuggestions',
  async ({ userId, context }: {
    userId: string;
    context?: {
      currentMood?: string;
      availableTime?: number;
      budget?: number;
      preferredCategories?: string[];
    };
  }) => {
    const response = await fetch('/api/weekly-targets/ai-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, context }),
    });
    return response.json();
  }
);

export const skipWeeklyTarget = createAsyncThunk(
  'weeklyTargets/skip',
  async ({ targetId, reason, userId }: {
    targetId: string;
    reason?: string;
    userId: string;
  }) => {
    const response = await fetch(`/api/weekly-targets/${targetId}/skip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, userId }),
    });
    return response.json();
  }
);

// Slice
const weeklyTargetsSlice = createSlice({
  name: 'weeklyTargets',
  initialState,
  reducers: {
    updateCurrentTarget: (state, action: PayloadAction<WeeklyTarget>) => {
      state.currentTarget = action.payload;
    },
    updateTargetProgressLocal: (state, action: PayloadAction<{
      categoryId: string;
      amount: number;
    }>) => {
      if (state.currentTarget) {
        const targetItem = state.currentTarget.targets.find(t => t.categoryId === action.payload.categoryId);
        if (targetItem) {
          targetItem.currentAmount += action.payload.amount;
          targetItem.progress = (targetItem.currentAmount / targetItem.targetAmount) * 100;

          // Update overall progress
          state.currentTarget.currentAmount += action.payload.amount;
          state.currentTarget.progress = (state.currentTarget.currentAmount / state.currentTarget.totalTargetAmount) * 100;
        }
      }
    },
    addPastTarget: (state, action: PayloadAction<WeeklyTarget>) => {
      state.pastTargets.unshift(action.payload);
      // Keep only last 12 weeks
      if (state.pastTargets.length > 12) {
        state.pastTargets = state.pastTargets.slice(0, 12);
      }
    },
    updateTargetStats: (state, action: PayloadAction<WeeklyTargetStats>) => {
      state.targetStats = action.payload;
    },
    updateLeaderboard: (state, action: PayloadAction<WeeklyTargetLeaderboard>) => {
      state.leaderboard = action.payload;
    },
    setAISuggestions: (state, action: PayloadAction<TargetItem[]>) => {
      state.aiSuggestions = action.payload;
    },
    clearWeeklyTargetsError: (state) => {
      state.error = null;
    },
    resetWeeklyTargetsState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch current weekly target
    builder
      .addCase(fetchCurrentWeeklyTarget.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentWeeklyTarget.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTarget = action.payload.target;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCurrentWeeklyTarget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch weekly target';
      });

    // Generate weekly target
    builder
      .addCase(generateWeeklyTarget.fulfilled, (state, action) => {
        state.currentTarget = action.payload.target;
        state.aiSuggestions = [];
      });

    // Update target progress
    builder
      .addCase(updateTargetProgress.fulfilled, (state, action) => {
        if (state.currentTarget) {
          state.currentTarget = action.payload.target;
        }
      });

    // Complete weekly target
    builder
      .addCase(completeWeeklyTarget.fulfilled, (state, action) => {
        if (state.currentTarget) {
          state.pastTargets.unshift({ ...state.currentTarget, ...action.payload.target });
          state.currentTarget = null;
        }
        // Update stats
        if (state.targetStats) {
          state.targetStats.completedWeeks += 1;
          state.targetStats.totalEarnedCoins += action.payload.coinsEarned;
          if (action.payload.coinsEarned > 0) {
            state.targetStats.currentStreak += 1;
            if (state.targetStats.currentStreak > state.targetStats.longestStreak) {
              state.targetStats.longestStreak = state.targetStats.currentStreak;
            }
          }
        }
      });

    // Fetch weekly target stats
    builder
      .addCase(fetchWeeklyTargetStats.fulfilled, (state, action) => {
        state.targetStats = action.payload.stats;
      });

    // Fetch weekly target leaderboard
    builder
      .addCase(fetchWeeklyTargetLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload.leaderboard;
      });

    // Customize weekly target
    builder
      .addCase(customizeWeeklyTarget.fulfilled, (state, action) => {
        state.currentTarget = action.payload.target;
      });

    // Get AI suggestions
    builder
      .addCase(getAISuggestions.fulfilled, (state, action) => {
        state.aiSuggestions = action.payload.suggestions;
      });

    // Skip weekly target
    builder
      .addCase(skipWeeklyTarget.fulfilled, (state, action) => {
        if (state.currentTarget && state.currentTarget.id === action.payload.targetId) {
          state.currentTarget.status = 'failed';
          state.pastTargets.unshift(state.currentTarget);
          state.currentTarget = null;
        }
        // Reset streak on skip
        if (state.targetStats) {
          state.targetStats.currentStreak = 0;
        }
      });
  },
});

export const {
  updateCurrentTarget,
  updateTargetProgressLocal,
  addPastTarget,
  updateTargetStats,
  updateLeaderboard,
  setAISuggestions,
  clearWeeklyTargetsError,
  resetWeeklyTargetsState,
} = weeklyTargetsSlice.actions;

export default weeklyTargetsSlice.reducer;