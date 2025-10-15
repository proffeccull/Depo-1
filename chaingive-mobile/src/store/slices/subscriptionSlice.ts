import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface SubscriptionPlan {
  id: string;
  name: 'Plus' | 'Pro';
  price: number; // coins per month
  features: string[];
  isPopular?: boolean;
  savings?: string;
}

interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  renewalDate: string;
  coinMultiplier: number;
  features: string[];
  paymentHistory: SubscriptionPayment[];
}

interface SubscriptionPayment {
  id: string;
  amount: number; // coins
  date: string;
  status: 'completed' | 'failed' | 'pending';
  planName: string;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  userSubscription: UserSubscription | null;
  paymentHistory: SubscriptionPayment[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: SubscriptionState = {
  plans: [
    {
      id: 'plus',
      name: 'Plus',
      price: 2000,
      features: [
        '2x Coin Earning',
        'Priority Matching',
        'Exclusive Marketplace',
        'Zero Fees',
        'Premium Badge',
        'Support Priority: High',
      ],
      isPopular: false,
      savings: '1,000 coins vs buying features separately',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 5000,
      features: [
        '3x Coin Earning',
        'All Plus Features',
        'Advanced Analytics',
        'Dedicated Support',
        'Early Access',
        'Custom Referral Bonus',
        'Support Priority: Urgent',
      ],
      isPopular: true,
      savings: '3,000 coins vs buying features separately',
    },
  ],
  userSubscription: null,
  paymentHistory: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserSubscription = createAsyncThunk(
  'subscription/fetchUserSubscription',
  async (userId: string) => {
    // API call to fetch user's subscription
    const response = await fetch(`/api/users/${userId}/subscription`);
    return response.json();
  }
);

export const purchaseSubscription = createAsyncThunk(
  'subscription/purchaseSubscription',
  async ({ userId, planId }: { userId: string; planId: string }) => {
    const response = await fetch(`/api/users/${userId}/subscription/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    return response.json();
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/subscription/cancel`, {
      method: 'POST',
    });
    return response.json();
  }
);

export const toggleAutoRenew = createAsyncThunk(
  'subscription/toggleAutoRenew',
  async ({ userId, enabled }: { userId: string; enabled: boolean }) => {
    const response = await fetch(`/api/users/${userId}/subscription/auto-renew`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    return response.json();
  }
);

export const fetchSubscriptionHistory = createAsyncThunk(
  'subscription/fetchSubscriptionHistory',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/subscription/history`);
    return response.json();
  }
);

// Slice
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscriptionPlans: (state, action: PayloadAction<SubscriptionPlan[]>) => {
      state.plans = action.payload;
    },
    updateUserSubscription: (state, action: PayloadAction<UserSubscription>) => {
      state.userSubscription = action.payload;
    },
    addSubscriptionPayment: (state, action: PayloadAction<SubscriptionPayment>) => {
      state.paymentHistory.unshift(action.payload);
      // Keep only last 50 payments
      if (state.paymentHistory.length > 50) {
        state.paymentHistory = state.paymentHistory.slice(0, 50);
      }
    },
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    resetSubscriptionState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch user subscription
    builder
      .addCase(fetchUserSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.userSubscription = action.payload;
      })
      .addCase(fetchUserSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subscription';
      });

    // Purchase subscription
    builder
      .addCase(purchaseSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(purchaseSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.userSubscription = action.payload.subscription;
        state.paymentHistory.unshift(action.payload.payment);
      })
      .addCase(purchaseSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to purchase subscription';
      });

    // Cancel subscription
    builder
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        if (state.userSubscription) {
          state.userSubscription.status = 'cancelled';
          state.userSubscription.autoRenew = false;
        }
      });

    // Toggle auto-renew
    builder
      .addCase(toggleAutoRenew.fulfilled, (state, action) => {
        if (state.userSubscription) {
          state.userSubscription.autoRenew = action.payload.autoRenew;
        }
      });

    // Fetch subscription history
    builder
      .addCase(fetchSubscriptionHistory.fulfilled, (state, action) => {
        state.paymentHistory = action.payload;
      });
  },
});

export const {
  setSubscriptionPlans,
  updateUserSubscription,
  addSubscriptionPayment,
  clearSubscriptionError,
  resetSubscriptionState,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;