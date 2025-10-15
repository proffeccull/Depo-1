import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BattlePassApi } from '../../api/battlePass';

interface BattlePassTier {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  unlocked: boolean;
  claimed: boolean;
  isPremium: boolean;
}

interface BattlePass {
  id: string;
  userId: string;
  currentTier: number;
  totalTiers: number;
  currentProgress: number;
  totalProgress: number;
  hasPremium: boolean;
  premiumCost: number;
  tiers: BattlePassTier[];
  seasonStart: string;
  seasonEnd: string;
  createdAt: string;
  updatedAt: string;
}

interface BattlePassState {
  battlePass: BattlePass | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: BattlePassState = {
  battlePass: null,
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunks
export const fetchBattlePass = createAsyncThunk(
  'battlePass/fetchBattlePass',
  async (userId: string) => {
    return await BattlePassApi.getBattlePass(userId);
  }
);

export const purchaseBattlePass = createAsyncThunk(
  'battlePass/purchaseBattlePass',
  async ({ userId, tier }: { userId: string; tier: 'premium' }) => {
    return await BattlePassApi.purchasePremium(userId, tier);
  }
);

export const claimBattlePassReward = createAsyncThunk(
  'battlePass/claimBattlePassReward',
  async ({ userId, tierIndex }: { userId: string; tierIndex: number }) => {
    return await BattlePassApi.claimReward(userId, tierIndex);
  }
);

export const updateBattlePassProgress = createAsyncThunk(
  'battlePass/updateProgress',
  async ({ userId, progress }: { userId: string; progress: number }) => {
    return await BattlePassApi.updateProgress(userId, progress);
  }
);

// Slice
const battlePassSlice = createSlice({
  name: 'battlePass',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBattlePass: (state) => {
      state.battlePass = null;
    },
    updateLocalProgress: (state, action: PayloadAction<number>) => {
      if (state.battlePass) {
        state.battlePass.currentProgress = Math.min(
          action.payload,
          state.battlePass.totalProgress
        );
        state.battlePass.currentTier = Math.floor(
          (state.battlePass.currentProgress / state.battlePass.totalProgress) * state.battlePass.totalTiers
        );
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch battle pass
    builder
      .addCase(fetchBattlePass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBattlePass.fulfilled, (state, action) => {
        state.loading = false;
        state.battlePass = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchBattlePass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch battle pass';
      })

      // Purchase battle pass
      .addCase(purchaseBattlePass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseBattlePass.fulfilled, (state, action) => {
        state.loading = false;
        if (state.battlePass) {
          state.battlePass.hasPremium = true;
          state.battlePass.tiers = action.payload.tiers;
        }
      })
      .addCase(purchaseBattlePass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to purchase battle pass';
      })

      // Claim battle pass reward
      .addCase(claimBattlePassReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(claimBattlePassReward.fulfilled, (state, action) => {
        state.loading = false;
        if (state.battlePass) {
          const tierIndex = action.meta.arg.tierIndex;
          if (state.battlePass.tiers[tierIndex]) {
            state.battlePass.tiers[tierIndex].claimed = true;
          }
        }
      })
      .addCase(claimBattlePassReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to claim reward';
      })

      // Update progress
      .addCase(updateBattlePassProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBattlePassProgress.fulfilled, (state, action) => {
        state.loading = false;
        if (state.battlePass) {
          state.battlePass.currentProgress = action.payload.currentProgress;
          state.battlePass.currentTier = action.payload.currentTier;
        }
      })
      .addCase(updateBattlePassProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update progress';
      });
  }
});

export const {
  clearError,
  clearBattlePass,
  updateLocalProgress,
} = battlePassSlice.actions;

export default battlePassSlice.reducer;