import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface SeasonalChallenge {
  id: string;
  season: number;
  title: string;
  description: string;
  type: 'donation' | 'cycle' | 'referral' | 'streak' | 'social';
  target: number;
  currentProgress: number;
  participants: number;
  prizePool: number;
  entryFee: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  rewards: ChallengeReward[];
  leaderboard: ChallengeParticipant[];
  rules: string[];
  bonuses: ChallengeBonus[];
}

interface ChallengeReward {
  rank: number;
  coins: number;
  badge?: string;
  title?: string;
  description?: string;
}

interface ChallengeParticipant {
  userId: string;
  userName: string;
  progress: number;
  rank: number;
  lastUpdated: string;
  joinedAt: string;
}

interface ChallengeBonus {
  condition: string;
  multiplier: number;
  description: string;
}

interface UserChallengeProgress {
  challengeId: string;
  userId: string;
  progress: number;
  completedTasks: string[];
  earnedRewards: ChallengeReward[];
  joinedAt: string;
  lastUpdated: string;
  streakDays: number;
  bonusMultiplier: number;
}

interface BattlePass {
  id: string;
  season: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  totalTiers: number;
  currentTier: number;
  xpRequired: number;
  xpCurrent: number;
  freeRewards: BattlePassReward[];
  premiumRewards: BattlePassReward[];
  isPremiumPurchased: boolean;
  premiumPrice: number;
  xpSources: XPSource[];
}

interface BattlePassReward {
  tier: number;
  coins: number;
  badge?: string;
  cosmetic?: string;
  title?: string;
  exclusive?: boolean;
}

interface XPSource {
  action: string;
  xpAmount: number;
  description: string;
  cooldown?: number; // minutes
}

interface ChallengesState {
  seasonalChallenges: SeasonalChallenge[];
  battlePass: BattlePass | null;
  userProgress: UserChallengeProgress[];
  leaderboard: ChallengeParticipant[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: ChallengesState = {
  seasonalChallenges: [],
  battlePass: null,
  userProgress: [],
  leaderboard: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchSeasonalChallenges = createAsyncThunk(
  'challenges/fetchSeasonalChallenges',
  async (season?: number) => {
    const response = await fetch(`/api/challenges/seasonal${season ? `?season=${season}` : ''}`);
    return response.json();
  }
);

export const fetchBattlePass = createAsyncThunk(
  'challenges/fetchBattlePass',
  async (season?: number) => {
    const response = await fetch(`/api/challenges/battle-pass${season ? `?season=${season}` : ''}`);
    return response.json();
  }
);

export const joinChallenge = createAsyncThunk(
  'challenges/joinChallenge',
  async ({ challengeId, userId }: { challengeId: string; userId: string }) => {
    const response = await fetch(`/api/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const updateChallengeProgress = createAsyncThunk(
  'challenges/updateChallengeProgress',
  async ({
    challengeId,
    userId,
    progress,
    taskId
  }: {
    challengeId: string;
    userId: string;
    progress: number;
    taskId?: string;
  }) => {
    const response = await fetch(`/api/challenges/${challengeId}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, progress, taskId }),
    });
    return response.json();
  }
);

export const purchaseBattlePass = createAsyncThunk(
  'challenges/purchaseBattlePass',
  async ({ battlePassId, userId }: { battlePassId: string; userId: string }) => {
    const response = await fetch(`/api/challenges/battle-pass/${battlePassId}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const claimBattlePassReward = createAsyncThunk(
  'challenges/claimBattlePassReward',
  async ({
    battlePassId,
    tier,
    userId,
    isPremium
  }: {
    battlePassId: string;
    tier: number;
    userId: string;
    isPremium: boolean;
  }) => {
    const response = await fetch(`/api/challenges/battle-pass/${battlePassId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tier, isPremium }),
    });
    return response.json();
  }
);

export const fetchChallengeLeaderboard = createAsyncThunk(
  'challenges/fetchChallengeLeaderboard',
  async (challengeId: string) => {
    const response = await fetch(`/api/challenges/${challengeId}/leaderboard`);
    return response.json();
  }
);

// Slice
const challengesSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    updateChallenge: (state, action: PayloadAction<SeasonalChallenge>) => {
      const index = state.seasonalChallenges.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.seasonalChallenges[index] = action.payload;
      }
    },
    updateUserChallengeProgress: (state, action: PayloadAction<UserChallengeProgress>) => {
      const index = state.userProgress.findIndex(p => p.challengeId === action.payload.challengeId);
      if (index !== -1) {
        state.userProgress[index] = action.payload;
      } else {
        state.userProgress.push(action.payload);
      }
    },
    updateBattlePass: (state, action: PayloadAction<Partial<BattlePass>>) => {
      if (state.battlePass) {
        state.battlePass = { ...state.battlePass, ...action.payload };
      }
    },
    addXP: (state, action: PayloadAction<{ amount: number; source: string }>) => {
      if (state.battlePass) {
        state.battlePass.xpCurrent += action.payload.amount;
        // Check for level up
        while (state.battlePass.xpCurrent >= state.battlePass.xpRequired &&
               state.battlePass.currentTier < state.battlePass.totalTiers) {
          state.battlePass.currentTier += 1;
          state.battlePass.xpCurrent -= state.battlePass.xpRequired;
        }
      }
    },
    clearChallengesError: (state) => {
      state.error = null;
    },
    resetChallengesState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch seasonal challenges
    builder
      .addCase(fetchSeasonalChallenges.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSeasonalChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.seasonalChallenges = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchSeasonalChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch challenges';
      });

    // Fetch battle pass
    builder
      .addCase(fetchBattlePass.fulfilled, (state, action) => {
        state.battlePass = action.payload;
      });

    // Join challenge
    builder
      .addCase(joinChallenge.fulfilled, (state, action) => {
        const challenge = state.seasonalChallenges.find(c => c.id === action.payload.challengeId);
        if (challenge) {
          challenge.participants += 1;
        }
        state.userProgress.push(action.payload.progress);
      });

    // Update challenge progress
    builder
      .addCase(updateChallengeProgress.fulfilled, (state, action) => {
        const progressIndex = state.userProgress.findIndex(p => p.challengeId === action.payload.challengeId);
        if (progressIndex !== -1) {
          state.userProgress[progressIndex] = action.payload;
        }
      });

    // Purchase battle pass
    builder
      .addCase(purchaseBattlePass.fulfilled, (state, action) => {
        if (state.battlePass) {
          state.battlePass.isPremiumPurchased = true;
        }
      });

    // Claim battle pass reward
    builder
      .addCase(claimBattlePassReward.fulfilled, (state, action) => {
        // Handle reward claiming success
        console.log('Battle pass reward claimed:', action.payload);
      });

    // Fetch challenge leaderboard
    builder
      .addCase(fetchChallengeLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload;
      });
  },
});

export const {
  updateChallenge,
  updateUserChallengeProgress,
  updateBattlePass,
  addXP,
  clearChallengesError,
  resetChallengesState,
} = challengesSlice.actions;

export default challengesSlice.reducer;