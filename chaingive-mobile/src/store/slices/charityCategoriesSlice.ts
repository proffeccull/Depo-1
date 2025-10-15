import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, API_ENDPOINTS, handleApiError } from '../../services/api';

// Types
export interface CharityCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  rewardMultiplier: number;
  isPremium: boolean;
  isActive: boolean;
  createdBy: string;
  popularity: number;
  featured: boolean;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedImpact: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserCategoryProgress {
  categoryId: string;
  userId: string;
  totalDonated: number;
  donationCount: number;
  lastDonation: string;
  streakDays: number;
  level: number;
  xp: number;
  achievements: string[];
  favorite: boolean;
}

export interface CategoryChallenge {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  targetAmount: number;
  rewardCoins: number;
  participants: number;
  maxParticipants?: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CategoryLeaderboard {
  categoryId: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'allTime';
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalDonated: number;
  donationCount: number;
  rank: number;
  change: number; // Rank change from previous period
}

interface CharityCategoriesState {
  categories: CharityCategory[];
  userProgress: UserCategoryProgress[];
  challenges: CategoryChallenge[];
  leaderboards: CategoryLeaderboard[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: CharityCategoriesState = {
  categories: [],
  userProgress: [],
  challenges: [],
  leaderboards: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks with real API integration
export const fetchCharityCategories = createAsyncThunk(
  'charityCategories/fetchCategories',
  async (filters: { isPremium?: boolean; featured?: boolean; tags?: string[] } | undefined, { rejectWithValue }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const endpoint = `${API_ENDPOINTS.CHARITY_CATEGORIES.LIST}?${queryParams}`;
    const response = await apiClient.get(endpoint);

    if (!response.success) {
      return rejectWithValue(handleApiError(response.error || 'Failed to fetch charity categories'));
    }

    return response.data;
  }
);

export const createCharityCategory = createAsyncThunk(
  'charityCategories/createCategory',
  async (categoryData: {
    name: string;
    description: string;
    icon: string;
    color: string;
    targetAmount: number;
    rewardMultiplier: number;
    isPremium: boolean;
    tags: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedImpact: number;
    createdBy: string;
  }, { rejectWithValue }) => {
    const response = await apiClient.post(API_ENDPOINTS.CHARITY_CATEGORIES.CREATE, categoryData);

    if (!response.success) {
      return rejectWithValue(handleApiError(response.error || 'Failed to create charity category'));
    }

    return response.data;
  }
);

export const updateCategoryProgress = createAsyncThunk(
  'charityCategories/updateProgress',
  async ({ categoryId, userId, amount }: {
    categoryId: string;
    userId: string;
    amount: number;
  }) => {
    const response = await fetch(`/api/charity-categories/${categoryId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });
    return response.json();
  }
);

export const fetchCategoryChallenges = createAsyncThunk(
  'charityCategories/fetchChallenges',
  async (categoryId: string) => {
    const response = await fetch(`/api/charity-categories/${categoryId}/challenges`);
    return response.json();
  }
);

export const joinCategoryChallenge = createAsyncThunk(
  'charityCategories/joinChallenge',
  async ({ challengeId, userId }: { challengeId: string; userId: string }) => {
    const response = await fetch(`/api/charity-categories/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const fetchCategoryLeaderboard = createAsyncThunk(
  'charityCategories/fetchLeaderboard',
  async ({ categoryId, timeframe }: { categoryId: string; timeframe: string }) => {
    const response = await fetch(`/api/charity-categories/${categoryId}/leaderboard?timeframe=${timeframe}`);
    return response.json();
  }
);

export const toggleCategoryFeatured = createAsyncThunk(
  'charityCategories/toggleFeatured',
  async ({ categoryId, featured, adminId }: {
    categoryId: string;
    featured: boolean;
    adminId: string;
  }) => {
    const response = await fetch(`/api/admin/charity-categories/${categoryId}/featured`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured, adminId }),
    });
    return response.json();
  }
);

// Slice
const charityCategoriesSlice = createSlice({
  name: 'charityCategories',
  initialState,
  reducers: {
    updateCategory: (state, action: PayloadAction<CharityCategory>) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    updateUserProgress: (state, action: PayloadAction<UserCategoryProgress>) => {
      const index = state.userProgress.findIndex(p => p.categoryId === action.payload.categoryId);
      if (index !== -1) {
        state.userProgress[index] = action.payload;
      } else {
        state.userProgress.push(action.payload);
      }
    },
    addChallenge: (state, action: PayloadAction<CategoryChallenge>) => {
      state.challenges.push(action.payload);
    },
    updateChallenge: (state, action: PayloadAction<CategoryChallenge>) => {
      const index = state.challenges.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.challenges[index] = action.payload;
      }
    },
    updateLeaderboard: (state, action: PayloadAction<CategoryLeaderboard>) => {
      const index = state.leaderboards.findIndex(l => l.categoryId === action.payload.categoryId);
      if (index !== -1) {
        state.leaderboards[index] = action.payload;
      } else {
        state.leaderboards.push(action.payload);
      }
    },
    clearCategoriesError: (state) => {
      state.error = null;
    },
    resetCategoriesState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch charity categories
    builder
      .addCase(fetchCharityCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCharityCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = (action.payload as any).categories || action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCharityCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });

    // Create charity category
    builder
      .addCase(createCharityCategory.fulfilled, (state, action) => {
        state.categories.push((action.payload as any).category || action.payload);
      });

    // Update category progress
    builder
      .addCase(updateCategoryProgress.fulfilled, (state, action) => {
        const progress = state.userProgress.find(p => p.categoryId === action.payload.categoryId);
        if (progress) {
          progress.totalDonated += action.payload.amount;
          progress.donationCount += 1;
          progress.lastDonation = new Date().toISOString();
          progress.xp += Math.floor(action.payload.amount * 0.1); // 10 XP per ₦1000
        }
      });

    // Fetch category challenges
    builder
      .addCase(fetchCategoryChallenges.fulfilled, (state, action) => {
        state.challenges = action.payload.challenges;
      });

    // Join category challenge
    builder
      .addCase(joinCategoryChallenge.fulfilled, (state, action) => {
        const challenge = state.challenges.find(c => c.id === action.payload.challengeId);
        if (challenge) {
          challenge.participants += 1;
        }
      });

    // Fetch category leaderboard
    builder
      .addCase(fetchCategoryLeaderboard.fulfilled, (state, action) => {
        const index = state.leaderboards.findIndex(l => l.categoryId === action.payload.categoryId);
        if (index !== -1) {
          state.leaderboards[index] = action.payload;
        } else {
          state.leaderboards.push(action.payload);
        }
      });

    // Toggle category featured
    builder
      .addCase(toggleCategoryFeatured.fulfilled, (state, action) => {
        const category = state.categories.find(c => c.id === action.payload.categoryId);
        if (category) {
          category.featured = action.payload.featured;
        }
      });
  },
});

export const {
  updateCategory,
  updateUserProgress,
  addChallenge,
  updateChallenge,
  updateLeaderboard,
  clearCategoriesError,
  resetCategoriesState,
} = charityCategoriesSlice.actions;

export default charityCategoriesSlice.reducer;