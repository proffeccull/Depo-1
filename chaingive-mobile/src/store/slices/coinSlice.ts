import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface CoinBalance {
  current: number;
  trend: 'up' | 'down' | 'stable';
  change24h: number;
  lastUpdated: string;
}

interface CoinTransaction {
  id: string;
  type: 'earned' | 'spent' | 'purchased' | 'transferred';
  amount: number;
  description: string;
  timestamp: string;
  category?: string;
  relatedId?: string;
}

interface CoinMilestone {
  id: string;
  name: string;
  target: number;
  current: number;
  reward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface CoinStreak {
  current: number;
  longest: number;
  lastActivity: string;
  freezeCount: number;
  nextMilestone: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  coinReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

interface BattlePass {
  id: string;
  name: string;
  season: number;
  cost: number;
  purchased: boolean;
  currentTier: number;
  maxTier: number;
  xpCurrent: number;
  xpRequired: number;
  freeRewards: any[];
  premiumRewards: any[];
  expiresAt: string;
}

interface CoinState {
  balance: CoinBalance;
  transactions: CoinTransaction[];
  milestones: CoinMilestone[];
  streak: CoinStreak;
  achievements: Achievement[];
  battlePass: BattlePass | null;
  marketplace: any[];
  leaderboard: any[];
  analytics: any;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CoinState = {
  balance: {
    current: 0,
    trend: 'stable',
    change24h: 0,
    lastUpdated: new Date().toISOString(),
  },
  transactions: [],
  milestones: [],
  streak: {
    current: 0,
    longest: 0,
    lastActivity: new Date().toISOString(),
    freezeCount: 0,
    nextMilestone: 7,
  },
  achievements: [],
  battlePass: null,
  marketplace: [],
  leaderboard: [],
  analytics: {},
  loading: false,
  error: null,
};

// Async thunks
export const fetchCoinBalance = createAsyncThunk(
  'coin/fetchBalance',
  async (userId: string) => {
    // API call to fetch coin balance
    const response = await fetch(`/api/users/${userId}/coins/balance`);
    return response.json();
  }
);

export const fetchCoinTransactions = createAsyncThunk(
  'coin/fetchTransactions',
  async ({ userId, limit = 20, offset = 0 }: { userId: string; limit?: number; offset?: number }) => {
    const response = await fetch(`/api/users/${userId}/coins/transactions?limit=${limit}&offset=${offset}`);
    return response.json();
  }
);

export const earnCoins = createAsyncThunk(
  'coin/earnCoins',
  async ({ userId, amount, source, description }: {
    userId: string;
    amount: number;
    source: string;
    description: string;
  }) => {
    const response = await fetch(`/api/users/${userId}/coins/earn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, source, description }),
    });
    return response.json();
  }
);

export const spendCoins = createAsyncThunk(
  'coin/spendCoins',
  async ({ userId, amount, category, description }: {
    userId: string;
    amount: number;
    category: string;
    description: string;
  }) => {
    const response = await fetch(`/api/users/${userId}/coins/spend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, category, description }),
    });
    return response.json();
  }
);

export const purchaseCoins = createAsyncThunk(
  'coin/purchaseCoins',
  async ({ userId, agentId, quantity }: {
    userId: string;
    agentId: string;
    quantity: number;
  }) => {
    const response = await fetch(`/api/users/${userId}/coins/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, quantity }),
    });
    return response.json();
  }
);

export const fetchAchievements = createAsyncThunk(
  'coin/fetchAchievements',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/achievements`);
    return response.json();
  }
);

export const unlockAchievement = createAsyncThunk(
  'coin/unlockAchievement',
  async ({ userId, achievementId }: { userId: string; achievementId: string }) => {
    const response = await fetch(`/api/users/${userId}/achievements/${achievementId}/unlock`, {
      method: 'POST',
    });
    return response.json();
  }
);

export const fetchBattlePass = createAsyncThunk(
  'coin/fetchBattlePass',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/battle-pass`);
    return response.json();
  }
);

export const purchaseBattlePass = createAsyncThunk(
  'coin/purchaseBattlePass',
  async ({ userId, seasonId }: { userId: string; seasonId: string }) => {
    const response = await fetch(`/api/users/${userId}/battle-pass/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seasonId }),
    });
    return response.json();
  }
);

export const fetchCoinAnalytics = createAsyncThunk(
  'coin/fetchAnalytics',
  async ({ userId, timeframe }: { userId: string; timeframe: string }) => {
    const response = await fetch(`/api/users/${userId}/coins/analytics?timeframe=${timeframe}`);
    return response.json();
  }
);

// Slice
const coinSlice = createSlice({
  name: 'coin',
  initialState,
  reducers: {
    updateBalance: (state, action: PayloadAction<Partial<CoinBalance>>) => {
      state.balance = { ...state.balance, ...action.payload };
    },
    addTransaction: (state, action: PayloadAction<CoinTransaction>) => {
      state.transactions.unshift(action.payload);
      // Keep only last 100 transactions
      if (state.transactions.length > 100) {
        state.transactions = state.transactions.slice(0, 100);
      }
    },
    updateStreak: (state, action: PayloadAction<Partial<CoinStreak>>) => {
      state.streak = { ...state.streak, ...action.payload };
    },
    updateMilestone: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const milestone = state.milestones.find(m => m.id === action.payload.id);
      if (milestone) {
        milestone.current = action.payload.progress;
        if (milestone.current >= milestone.target && !milestone.unlocked) {
          milestone.unlocked = true;
          milestone.unlockedAt = new Date().toISOString();
          // Award coins for milestone completion
          state.balance.current += milestone.reward;
        }
      }
    },
    updateAchievement: (state, action: PayloadAction<{ id: string; progress?: number; unlocked?: boolean }>) => {
      const achievement = state.achievements.find(a => a.id === action.payload.id);
      if (achievement) {
        if (action.payload.progress !== undefined) {
          achievement.progress = action.payload.progress;
        }
        if (action.payload.unlocked) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date().toISOString();
          // Award coins for achievement unlock
          state.balance.current += achievement.coinReward;
        }
      }
    },
    updateBattlePassProgress: (state, action: PayloadAction<{ xpGained: number }>) => {
      if (state.battlePass) {
        state.battlePass.xpCurrent += action.payload.xpGained;
        // Check for tier advancement
        while (state.battlePass.xpCurrent >= state.battlePass.xpRequired &&
               state.battlePass.currentTier < state.battlePass.maxTier) {
          state.battlePass.currentTier++;
          state.battlePass.xpCurrent -= state.battlePass.xpRequired;
          // Award tier rewards
          // Implementation depends on reward structure
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetCoinState: () => initialState,
  },
  extraReducers: (builder) => {
    // Balance
    builder
      .addCase(fetchCoinBalance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCoinBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fetchCoinBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch balance';
      });

    // Transactions
    builder
      .addCase(fetchCoinTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCoinTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchCoinTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      });

    // Earn coins
    builder
      .addCase(earnCoins.pending, (state) => {
        state.loading = true;
      })
      .addCase(earnCoins.fulfilled, (state, action) => {
        state.loading = false;
        state.balance.current += action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
      })
      .addCase(earnCoins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to earn coins';
      });

    // Spend coins
    builder
      .addCase(spendCoins.pending, (state) => {
        state.loading = true;
      })
      .addCase(spendCoins.fulfilled, (state, action) => {
        state.loading = false;
        state.balance.current -= action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
      })
      .addCase(spendCoins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to spend coins';
      });

    // Purchase coins
    builder
      .addCase(purchaseCoins.pending, (state) => {
        state.loading = true;
      })
      .addCase(purchaseCoins.fulfilled, (state, action) => {
        state.loading = false;
        state.balance.current += action.payload.amount;
        state.transactions.unshift(action.payload.transaction);
      })
      .addCase(purchaseCoins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to purchase coins';
      });

    // Achievements
    builder
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.achievements = action.payload;
      })
      .addCase(unlockAchievement.fulfilled, (state, action) => {
        const achievement = state.achievements.find(a => a.id === action.payload.id);
        if (achievement) {
          achievement.unlocked = true;
          achievement.unlockedAt = action.payload.unlockedAt;
          state.balance.current += achievement.coinReward;
        }
      });

    // Battle Pass
    builder
      .addCase(fetchBattlePass.fulfilled, (state, action) => {
        state.battlePass = action.payload;
      })
      .addCase(purchaseBattlePass.fulfilled, (state, action) => {
        if (state.battlePass) {
          state.battlePass.purchased = true;
        }
      });

    // Analytics
    builder
      .addCase(fetchCoinAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const {
  updateBalance,
  addTransaction,
  updateStreak,
  updateMilestone,
  updateAchievement,
  updateBattlePassProgress,
  clearError,
  resetCoinState,
} = coinSlice.actions;

export default coinSlice.reducer;