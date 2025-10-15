import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, API_ENDPOINTS, handleApiError } from '../../services/api';

// Types
interface BattlePassTier {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  unlocked: boolean;
  claimed: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  icon?: string;
}

interface BattlePass {
  id: string;
  userId: string;
  seasonName: string;
  seasonStart: string;
  seasonEnd: string;
  currentProgress: number;
  totalProgress: number;
  currentTier: number;
  totalTiers: number;
  hasPremium: boolean;
  premiumCost: number;
  tiers: BattlePassTier[];
  lastUpdated: string;
}

interface BattlePassState {
  battlePass: BattlePass | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: BattlePassState = {
  battlePass: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks with real API integration
export const fetchBattlePass = createAsyncThunk(
  'battlePass/fetchBattlePass',
  async (userId: string, { rejectWithValue }) => {
    const response = await apiClient.get<BattlePass>(API_ENDPOINTS.BATTLE_PASS.FETCH.replace(':userId', userId));

    if (!response.success) {
      return rejectWithValue(handleApiError(response.error || 'Failed to fetch battle pass'));
    }

    return response.data;
  }
);

export const purchaseBattlePass = createAsyncThunk(
  'battlePass/purchaseBattlePass',
  async ({ userId, tier }: { userId: string; tier: 'premium' }, { rejectWithValue }) => {
    const response = await apiClient.post(
      API_ENDPOINTS.BATTLE_PASS.PURCHASE.replace(':userId', userId),
      { tier }
    );

    if (!response.success) {
      return rejectWithValue(handleApiError(response.error || 'Failed to purchase battle pass'));
    }

    return response.data;
  }
);

export const claimBattlePassReward = createAsyncThunk(
  'battlePass/claimBattlePassReward',
  async ({ userId, tierIndex }: { userId: string; tierIndex: number }, { rejectWithValue }) => {
    const response = await apiClient.post(
      API_ENDPOINTS.BATTLE_PASS.CLAIM.replace(':userId', userId),
      { tierIndex }
    );

    if (!response.success) {
      return rejectWithValue(handleApiError(response.error || 'Failed to claim battle pass reward'));
    }

    return { data: response.data, tierIndex };
  }
);

// Slice
const battlePassSlice = createSlice({
  name: 'battlePass',
  initialState,
  reducers: {
    clearBattlePassError: (state) => {
      state.error = null;
    },
    resetBattlePassState: () => initialState,
    updateBattlePassProgress: (state, action: PayloadAction<{ progress: number }>) => {
      if (state.battlePass) {
        state.battlePass.currentProgress = action.payload.progress;
        state.lastUpdated = new Date().toISOString();
      }
    },
    updateBattlePassTier: (state, action: PayloadAction<{ tierIndex: number; unlocked: boolean; claimed?: boolean }>) => {
      if (state.battlePass && state.battlePass.tiers[action.payload.tierIndex]) {
        state.battlePass.tiers[action.payload.tierIndex].unlocked = action.payload.unlocked;
        if (action.payload.claimed !== undefined) {
          state.battlePass.tiers[action.payload.tierIndex].claimed = action.payload.claimed;
        }
        state.lastUpdated = new Date().toISOString();
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
        state.battlePass = action.payload as BattlePass;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchBattlePass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch battle pass';
      });

    // Purchase battle pass
    builder
      .addCase(purchaseBattlePass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseBattlePass.fulfilled, (state, action) => {
        state.loading = false;
        if (state.battlePass) {
          state.battlePass.hasPremium = true;
          state.battlePass.tiers = (action.payload as any).tiers;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(purchaseBattlePass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to purchase battle pass';
      });

    // Claim battle pass reward
    builder
      .addCase(claimBattlePassReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(claimBattlePassReward.fulfilled, (state, action) => {
        state.loading = false;
        if (state.battlePass && action.payload.tierIndex !== undefined) {
          state.battlePass.tiers[action.payload.tierIndex].claimed = true;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(claimBattlePassReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to claim battle pass reward';
      });
  },
});

export const {
  clearBattlePassError,
  resetBattlePassState,
  updateBattlePassProgress,
  updateBattlePassTier,
} = battlePassSlice.actions;

export default battlePassSlice.reducer;