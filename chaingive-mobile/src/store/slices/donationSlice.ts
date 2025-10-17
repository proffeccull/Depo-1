import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { donationsAPI } from '../../api/donations';
import { analytics } from '../../services/analyticsService';
import { DonationCycle } from '../../types';

interface DonationState {
  isProcessing: boolean;
  error: string | null;
  cycles: DonationCycle[];
  isLoadingCycles: boolean;
  selectedCycle: DonationCycle | null;
  parties?: { donor?: { name: string; location?: string }; recipient?: { name: string; location?: string } } | null;
}

const initialState: DonationState = {
  isProcessing: false,
  error: null,
  cycles: [],
  isLoadingCycles: false,
  selectedCycle: null,
  parties: null,
};

export const giveDonation = createAsyncThunk(
  'donations/give',
  async (payload: {
    amount: number;
    recipientPreference: 'algorithm' | 'manual';
    recipientId?: string;
    location?: string;
    faith?: string;
  }) => {
    try {
      const res = await donationsAPI.give(payload);
      analytics.track('donation_initiated', { amount: payload.amount, preference: payload.recipientPreference });
      return res.data;
    } catch (e: any) {
      return Promise.reject(new Error(e.message || 'Failed to initiate donation'));
    }
  }
);

export const confirmReceipt = createAsyncThunk(
  'donations/confirmReceipt',
  async (payload: { transactionId: string; confirm: boolean }) => {
    try {
      const res = await donationsAPI.confirmReceipt(payload);
      analytics.track('donation_receipt_confirmed', { transactionId: payload.transactionId });
      return res.data;
    } catch (e: any) {
      return Promise.reject(new Error(e.message || 'Failed to confirm receipt'));
    }
  }
);

export const fetchCycles = createAsyncThunk(
  'donations/fetchCycles',
  async (params?: { status?: string; page?: number; limit?: number; search?: string }) => {
    const res = await donationsAPI.getCycles(params);
    return res.data;
  }
);

export const fetchCycleById = createAsyncThunk(
  'donations/fetchCycleById',
  async (cycleId: string) => {
    const res = await donationsAPI.getCycle(cycleId);
    return res.data;
  }
);

export const fetchCycleParties = createAsyncThunk(
  'donations/fetchCycleParties',
  async (cycleId: string) => {
    const res = await donationsAPI.getParties(cycleId);
    return res.data as { donor?: { name: string; location?: string }; recipient?: { name: string; location?: string } };
  }
);

const donationSlice = createSlice({
  name: 'donation',
  initialState,
  reducers: {
    clearDonationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(giveDonation.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(giveDonation.fulfilled, (state) => {
        state.isProcessing = false;
      })
      .addCase(giveDonation.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.error.message || 'Failed to initiate donation';
      })
      .addCase(confirmReceipt.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(confirmReceipt.fulfilled, (state) => {
        state.isProcessing = false;
        try {
          analytics.track('donation_receipt_confirm_success');
        } catch {}
      })
      .addCase(confirmReceipt.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.error.message || 'Failed to confirm receipt';
        try {
          analytics.track('donation_receipt_confirm_failure', { error: state.error });
        } catch {}
      })
      .addCase(fetchCycles.pending, (state) => {
        state.isLoadingCycles = true;
        state.error = null;
      })
      .addCase(fetchCycles.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoadingCycles = false;
        const data: any = action.payload;
        const items: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];
        state.cycles = items as DonationCycle[];
      })
      .addCase(fetchCycles.rejected, (state, action) => {
        state.isLoadingCycles = false;
        state.error = action.error.message || 'Failed to fetch cycles';
      })
      .addCase(fetchCycleById.fulfilled, (state, action: PayloadAction<DonationCycle>) => {
        state.selectedCycle = action.payload;
      })
      .addCase(fetchCycleParties.fulfilled, (state, action) => {
        state.parties = action.payload;
      });
  },
});

export const { clearDonationError } = donationSlice.actions;
export default donationSlice.reducer;
