import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface UserLevel {
  id: string;
  userId: string;
  level: number;
  xp: number;
  xpToNext: number;
  totalXP: number;
  levelName: string;
  levelColor: string;
  levelIcon: string;
  perks: LevelPerk[];
  unlockedAt: string;
  progress: number; // 0-100
}

export interface LevelPerk {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'coin_multiplier' | 'faster_earning' | 'exclusive_access' | 'priority_support' | 'customization' | 'social_badge';
  value?: number; // For multipliers, percentages, etc.
  isActive: boolean;
  unlockedAt: string;
}

export interface LevelMilestone {
  level: number;
  name: string;
  description: string;
  rewards: MilestoneReward[];
  requirements: MilestoneRequirement[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface MilestoneReward {
  type: 'coins' | 'badge' | 'title' | 'perk' | 'nft';
  value: number | string;
  name?: string;
  description?: string;
}

export interface MilestoneRequirement {
  type: 'total_donations' | 'total_coins_earned' | 'streak_days' | 'crew_members' | 'trust_reviews';
  value: number;
  current: number;
  description: string;
}

export interface LevelProgress {
  userId: string;
  currentLevel: number;
  currentXP: number;
  xpToNext: number;
  progressPercent: number;
  recentXP: XPEntry[];
  weeklyXP: number;
  monthlyXP: number;
  totalXP: number;
  levelUpStreak: number;
  fastestLevelUp: number; // Days to level up
}

export interface XPEntry {
  id: string;
  amount: number;
  reason: string;
  category: 'donation' | 'review' | 'crew' | 'challenge' | 'achievement' | 'streak';
  timestamp: string;
  multiplier?: number;
}

export interface LevelLeaderboard {
  timeframe: 'weekly' | 'monthly' | 'allTime';
  entries: LevelLeaderboardEntry[];
  lastUpdated: string;
  totalParticipants: number;
}

export interface LevelLeaderboardEntry {
  userId: string;
  userName: string;
  level: number;
  totalXP: number;
  weeklyXP: number;
  rank: number;
  change: number;
  avatar?: string;
}

export interface LevelConfig {
  levels: LevelDefinition[];
  xpRates: XPRate[];
  multipliers: XPMultiplier[];
  lastUpdated: string;
}

export interface LevelDefinition {
  level: number;
  name: string;
  color: string;
  icon: string;
  xpRequired: number;
  perks: LevelPerk[];
  milestone?: LevelMilestone;
}

export interface XPRate {
  action: string;
  baseXP: number;
  category: 'donation' | 'review' | 'crew' | 'challenge' | 'achievement' | 'streak';
  description: string;
}

export interface XPMultiplier {
  condition: string;
  multiplier: number;
  description: string;
  isActive: boolean;
}

interface UserLevelsState {
  userLevel: UserLevel | null;
  levelProgress: LevelProgress | null;
  levelConfig: LevelConfig | null;
  recentXP: XPEntry[];
  levelLeaderboard: LevelLeaderboard | null;
  availablePerks: LevelPerk[];
  completedMilestones: LevelMilestone[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: UserLevelsState = {
  userLevel: null,
  levelProgress: null,
  levelConfig: null,
  recentXP: [],
  levelLeaderboard: null,
  availablePerks: [],
  completedMilestones: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchUserLevel = createAsyncThunk(
  'userLevels/fetchUserLevel',
  async (userId: string) => {
    const response = await fetch(`/api/user-levels/${userId}`);
    return response.json();
  }
);

export const fetchLevelProgress = createAsyncThunk(
  'userLevels/fetchProgress',
  async (userId: string) => {
    const response = await fetch(`/api/user-levels/${userId}/progress`);
    return response.json();
  }
);

export const fetchLevelConfig = createAsyncThunk(
  'userLevels/fetchConfig',
  async () => {
    const response = await fetch('/api/user-levels/config');
    return response.json();
  }
);

export const awardXP = createAsyncThunk(
  'userLevels/awardXP',
  async ({ userId, amount, reason, category, multiplier }: {
    userId: string;
    amount: number;
    reason: string;
    category: 'donation' | 'review' | 'crew' | 'challenge' | 'achievement' | 'streak';
    multiplier?: number;
  }) => {
    const response = await fetch('/api/user-levels/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, reason, category, multiplier }),
    });
    return response.json();
  }
);

export const checkLevelUp = createAsyncThunk(
  'userLevels/checkLevelUp',
  async (userId: string) => {
    const response = await fetch(`/api/user-levels/${userId}/check-level-up`, {
      method: 'POST',
    });
    return response.json();
  }
);

export const unlockLevelPerk = createAsyncThunk(
  'userLevels/unlockPerk',
  async ({ userId, perkId }: { userId: string; perkId: string }) => {
    const response = await fetch(`/api/user-levels/${userId}/perks/${perkId}/unlock`, {
      method: 'POST',
    });
    return response.json();
  }
);

export const fetchLevelLeaderboard = createAsyncThunk(
  'userLevels/fetchLeaderboard',
  async (timeframe: 'weekly' | 'monthly' | 'allTime' = 'weekly') => {
    const response = await fetch(`/api/user-levels/leaderboard?timeframe=${timeframe}`);
    return response.json();
  }
);

export const fetchRecentXP = createAsyncThunk(
  'userLevels/fetchRecentXP',
  async ({ userId, limit }: { userId: string; limit?: number }) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(`/api/user-levels/${userId}/xp/recent${params}`);
    return response.json();
  }
);

export const completeLevelMilestone = createAsyncThunk(
  'userLevels/completeMilestone',
  async ({ userId, milestoneLevel }: { userId: string; milestoneLevel: number }) => {
    const response = await fetch(`/api/user-levels/${userId}/milestones/${milestoneLevel}/complete`, {
      method: 'POST',
    });
    return response.json();
  }
);

export const calculateXPPreview = createAsyncThunk(
  'userLevels/calculatePreview',
  async ({ userId, action, context }: {
    userId: string;
    action: string;
    context?: any;
  }) => {
    const response = await fetch('/api/user-levels/xp/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, context }),
    });
    return response.json();
  }
);

// Slice
const userLevelsSlice = createSlice({
  name: 'userLevels',
  initialState,
  reducers: {
    updateUserLevel: (state, action: PayloadAction<UserLevel>) => {
      state.userLevel = action.payload;
    },
    updateLevelProgress: (state, action: PayloadAction<LevelProgress>) => {
      state.levelProgress = action.payload;
    },
    addXPEntry: (state, action: PayloadAction<XPEntry>) => {
      state.recentXP.unshift(action.payload);
      // Keep only last 50 entries
      if (state.recentXP.length > 50) {
        state.recentXP = state.recentXP.slice(0, 50);
      }
      // Update progress
      if (state.levelProgress) {
        state.levelProgress.currentXP += action.payload.amount;
        state.levelProgress.totalXP += action.payload.amount;
        state.levelProgress.progressPercent = (state.levelProgress.currentXP / (state.levelProgress.currentXP + state.levelProgress.xpToNext)) * 100;
      }
    },
    updateLevelLeaderboard: (state, action: PayloadAction<LevelLeaderboard>) => {
      state.levelLeaderboard = action.payload;
    },
    addCompletedMilestone: (state, action: PayloadAction<LevelMilestone>) => {
      state.completedMilestones.push(action.payload);
    },
    updateAvailablePerks: (state, action: PayloadAction<LevelPerk[]>) => {
      state.availablePerks = action.payload;
    },
    clearUserLevelsError: (state) => {
      state.error = null;
    },
    resetUserLevelsState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch user level
    builder
      .addCase(fetchUserLevel.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserLevel.fulfilled, (state, action) => {
        state.loading = false;
        state.userLevel = action.payload.level;
        state.availablePerks = action.payload.perks;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user level';
      });

    // Fetch level progress
    builder
      .addCase(fetchLevelProgress.fulfilled, (state, action) => {
        state.levelProgress = action.payload.progress;
      });

    // Fetch level config
    builder
      .addCase(fetchLevelConfig.fulfilled, (state, action) => {
        state.levelConfig = action.payload.config;
      });

    // Award XP
    builder
      .addCase(awardXP.fulfilled, (state, action) => {
        // Update local XP entries
        state.recentXP.unshift(action.payload.xpEntry);
        if (state.recentXP.length > 50) {
          state.recentXP = state.recentXP.slice(0, 50);
        }
        // Update progress
        if (state.levelProgress) {
          state.levelProgress.currentXP += action.payload.xpEntry.amount;
          state.levelProgress.totalXP += action.payload.xpEntry.amount;
        }
      });

    // Check level up
    builder
      .addCase(checkLevelUp.fulfilled, (state, action) => {
        if (action.payload.leveledUp && state.userLevel) {
          state.userLevel = action.payload.newLevel;
          state.availablePerks = action.payload.newPerks;
          // Add level up animation trigger here
        }
      });

    // Unlock level perk
    builder
      .addCase(unlockLevelPerk.fulfilled, (state, action) => {
        const perk = state.availablePerks.find(p => p.id === action.payload.perkId);
        if (perk) {
          perk.isActive = true;
        }
      });

    // Fetch level leaderboard
    builder
      .addCase(fetchLevelLeaderboard.fulfilled, (state, action) => {
        state.levelLeaderboard = action.payload.leaderboard;
      });

    // Fetch recent XP
    builder
      .addCase(fetchRecentXP.fulfilled, (state, action) => {
        state.recentXP = action.payload.xpEntries;
      });

    // Complete level milestone
    builder
      .addCase(completeLevelMilestone.fulfilled, (state, action) => {
        state.completedMilestones.push(action.payload.milestone);
        // Award milestone rewards
        if (action.payload.rewards) {
          // Handle rewards (coins, badges, etc.)
        }
      });

    // Calculate XP preview
    builder
      .addCase(calculateXPPreview.fulfilled, (state, action) => {
        // This is just for preview, no state changes needed
      });
  },
});

export const {
  updateUserLevel,
  updateLevelProgress,
  addXPEntry,
  updateLevelLeaderboard,
  addCompletedMilestone,
  updateAvailablePerks,
  clearUserLevelsError,
  resetUserLevelsState,
} = userLevelsSlice.actions;

export default userLevelsSlice.reducer;