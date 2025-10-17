import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { coinPurchaseAPI } from '../../api/coinPurchase';

interface Agent {
  id: string;
  userId: string;
  agentCode: string;
  coinBalance: number;
  user: {
    firstName: string;
    lastName: string;
    locationCity: string;
    trustScore: number;
  };
}

interface CoinPurchase {
  id: string;
  agentId: string;
  quantity: number;
  pricePerCoin: number;
  totalPrice: number;
  status: 'pending' | 'escrowed' | 'paid' | 'completed' | 'cancelled' | 'expired';
  paymentMethod?: string;
  createdAt: string;
}

interface CoinPurchaseState {
  availableAgents: Agent[];
  purchaseHistory: CoinPurchase[];
  pendingPurchases: CoinPurchase[];
  loading: boolean;
  error: string | null;
}

const initialState: CoinPurchaseState = {
  availableAgents: [],
  purchaseHistory: [],
  pendingPurchases: [],
  loading: false,
  error: null,
};

export const fetchAvailableAgents = createAsyncThunk(
  'coinPurchase/fetchAvailableAgents',
  async () => {
    const res = await coinPurchaseAPI.getAvailableAgents();
    return res.data;
  }
);

export const requestCoinPurchase = createAsyncThunk(
  'coinPurchase/request',
  async (data: { agentId: string; quantity: number }) => {
    const res = await coinPurchaseAPI.requestPurchase(data);
    return res.data;
  }
);

export const confirmPayment = createAsyncThunk(
  'coinPurchase/confirmPayment',
  async (data: {
    transactionId: string;
    paymentMethod: 'bank_transfer' | 'mobile_money' | 'cash';
    paymentProof?: string;
  }) => {
    const res = await coinPurchaseAPI.confirmPayment(data);
    return res.data;
  }
);

export const fetchPurchaseHistory = createAsyncThunk(
  'coinPurchase/fetchHistory',
  async (params?: { search?: string; status?: string }) => {
    const res = await coinPurchaseAPI.getPurchaseHistory(params);
    return res.data;
  }
);

export const fetchPendingPurchases = createAsyncThunk(
  'coinPurchase/fetchPending',
  async () => {
    const res = await coinPurchaseAPI.getPendingPurchases();
    return res.data;
  }
);

const coinPurchaseSlice = createSlice({
  name: 'coinPurchase',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch available agents
      .addCase(fetchAvailableAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.availableAgents = action.payload.agents || action.payload || [];
      })
      .addCase(fetchAvailableAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load agents';
      })
      
      // Request purchase
      .addCase(requestCoinPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestCoinPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingPurchases.unshift(action.payload);
      })
      .addCase(requestCoinPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to request purchase';
      })
      
      // Confirm payment
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.loading = false;
        // Update pending purchase status
        const purchase = state.pendingPurchases.find(p => p.id === action.payload.id);
        if (purchase) {
          purchase.status = 'paid';
        }
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to confirm payment';
      })
      
      // Fetch history
      .addCase(fetchPurchaseHistory.fulfilled, (state, action) => {
        state.purchaseHistory = action.payload.purchases || action.payload || [];
      })
      
      // Fetch pending
      .addCase(fetchPendingPurchases.fulfilled, (state, action) => {
        state.pendingPurchases = action.payload.purchases || action.payload || [];
      });
  },
});

export const { clearError } = coinPurchaseSlice.actions;
export default coinPurchaseSlice.reducer;
