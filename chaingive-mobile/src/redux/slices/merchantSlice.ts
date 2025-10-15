import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MerchantApi } from '../../api/merchant';
import {
  MerchantAccount,
  CreateMerchantRequest,
  UpdateMerchantRequest,
  MerchantPayment,
  ProcessPaymentRequest,
  MerchantAnalytics,
  MerchantSearchFilters
} from '../../types/merchant';

interface MerchantState {
  merchants: MerchantAccount[];
  currentMerchant: MerchantAccount | null;
  merchantPayments: MerchantPayment[];
  analytics: MerchantAnalytics | null;
  loading: boolean;
  error: string | null;
  searchFilters: MerchantSearchFilters;
}

const initialState: MerchantState = {
  merchants: [],
  currentMerchant: null,
  merchantPayments: [],
  analytics: null,
  loading: false,
  error: null,
  searchFilters: {
    limit: 20,
    offset: 0
  }
};

// Async thunks
export const createMerchant = createAsyncThunk(
  'merchant/createMerchant',
  async (data: CreateMerchantRequest) => {
    return await MerchantApi.createMerchant(data);
  }
);

export const getMerchant = createAsyncThunk(
  'merchant/getMerchant',
  async (merchantId: string) => {
    return await MerchantApi.getMerchant(merchantId);
  }
);

export const updateMerchant = createAsyncThunk(
  'merchant/updateMerchant',
  async ({ merchantId, data }: { merchantId: string; data: UpdateMerchantRequest }) => {
    return await MerchantApi.updateMerchant(merchantId, data);
  }
);

export const deleteMerchant = createAsyncThunk(
  'merchant/deleteMerchant',
  async (merchantId: string) => {
    await MerchantApi.deleteMerchant(merchantId);
    return merchantId;
  }
);

export const getMerchantsByLocation = createAsyncThunk(
  'merchant/getMerchantsByLocation',
  async ({ lat, lng, radius }: { lat: number; lng: number; radius?: number }) => {
    return await MerchantApi.getMerchantsByLocation(lat, lng, radius);
  }
);

export const searchMerchants = createAsyncThunk(
  'merchant/searchMerchants',
  async (filters: MerchantSearchFilters) => {
    return await MerchantApi.searchMerchants(filters);
  }
);

export const processPayment = createAsyncThunk(
  'merchant/processPayment',
  async ({ merchantId, data }: { merchantId: string; data: ProcessPaymentRequest }) => {
    return await MerchantApi.processPayment(merchantId, data);
  }
);

export const getMerchantPayments = createAsyncThunk(
  'merchant/getMerchantPayments',
  async ({ merchantId, limit, offset }: { merchantId: string; limit?: number; offset?: number }) => {
    return await MerchantApi.getMerchantPayments(merchantId, limit, offset);
  }
);

export const getMerchantAnalytics = createAsyncThunk(
  'merchant/getMerchantAnalytics',
  async ({ merchantId, period }: { merchantId: string; period?: '7d' | '30d' | '90d' | '1y' }) => {
    return await MerchantApi.getMerchantAnalytics(merchantId, period);
  }
);

// Slice
const merchantSlice = createSlice({
  name: 'merchant',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchFilters: (state, action: PayloadAction<MerchantSearchFilters>) => {
      state.searchFilters = action.payload;
    },
    clearCurrentMerchant: (state) => {
      state.currentMerchant = null;
    },
    clearAnalytics: (state) => {
      state.analytics = null;
    }
  },
  extraReducers: (builder) => {
    // Create merchant
    builder
      .addCase(createMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMerchant = action.payload;
        state.merchants.unshift(action.payload);
      })
      .addCase(createMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create merchant';
      })

      // Get merchant
      .addCase(getMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMerchant = action.payload;
      })
      .addCase(getMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get merchant';
      })

      // Update merchant
      .addCase(updateMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMerchant = action.payload;
        const index = state.merchants.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.merchants[index] = action.payload;
        }
      })
      .addCase(updateMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update merchant';
      })

      // Delete merchant
      .addCase(deleteMerchant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.merchants = state.merchants.filter(m => m.id !== action.payload);
        if (state.currentMerchant?.id === action.payload) {
          state.currentMerchant = null;
        }
      })
      .addCase(deleteMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete merchant';
      })

      // Get merchants by location
      .addCase(getMerchantsByLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMerchantsByLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.merchants = action.payload;
      })
      .addCase(getMerchantsByLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get merchants by location';
      })

      // Search merchants
      .addCase(searchMerchants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMerchants.fulfilled, (state, action) => {
        state.loading = false;
        state.merchants = action.payload;
      })
      .addCase(searchMerchants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search merchants';
      })

      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.merchantPayments.unshift(action.payload);
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to process payment';
      })

      // Get merchant payments
      .addCase(getMerchantPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMerchantPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.merchantPayments = action.payload;
      })
      .addCase(getMerchantPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get merchant payments';
      })

      // Get merchant analytics
      .addCase(getMerchantAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMerchantAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getMerchantAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get merchant analytics';
      });
  }
});

export const {
  clearError,
  setSearchFilters,
  clearCurrentMerchant,
  clearAnalytics
} = merchantSlice.actions;

export default merchantSlice.reducer;