import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CorporateApi } from '../../api/corporate';
import {
  CorporateAccount,
  CreateCorporateRequest,
  UpdateCorporateRequest,
  CorporateTeamMember,
  CorporateDonation,
  CorporateAnalytics,
  BulkUserCreationRequest,
  BulkDonationRequest,
  CSRTracking
} from '../../types/corporate';

interface CorporateState {
  corporates: CorporateAccount[];
  currentCorporate: CorporateAccount | null;
  teamMembers: CorporateTeamMember[];
  donations: CorporateDonation[];
  analytics: CorporateAnalytics | null;
  csrTracking: CSRTracking | null;
  loading: boolean;
  error: string | null;
}

const initialState: CorporateState = {
  corporates: [],
  currentCorporate: null,
  teamMembers: [],
  donations: [],
  analytics: null,
  csrTracking: null,
  loading: false,
  error: null
};

// Async thunks
export const createCorporate = createAsyncThunk(
  'corporate/createCorporate',
  async (data: CreateCorporateRequest) => {
    return await CorporateApi.createCorporateAccount(data);
  }
);

export const getCorporate = createAsyncThunk(
  'corporate/getCorporate',
  async (corporateId: string) => {
    return await CorporateApi.getCorporateAccount(corporateId);
  }
);

export const updateCorporate = createAsyncThunk(
  'corporate/updateCorporate',
  async ({ corporateId, data }: { corporateId: string; data: UpdateCorporateRequest }) => {
    return await CorporateApi.updateCorporateAccount(corporateId, data);
  }
);

export const deleteCorporate = createAsyncThunk(
  'corporate/deleteCorporate',
  async (corporateId: string) => {
    await CorporateApi.deleteCorporateAccount(corporateId);
    return corporateId;
  }
);

export const bulkCreateUsers = createAsyncThunk(
  'corporate/bulkCreateUsers',
  async ({ corporateId, data }: { corporateId: string; data: BulkUserCreationRequest }) => {
    return await CorporateApi.bulkCreateUsers(corporateId, data);
  }
);

export const bulkInitiateDonations = createAsyncThunk(
  'corporate/bulkInitiateDonations',
  async ({ corporateId, data }: { corporateId: string; data: BulkDonationRequest }) => {
    return await CorporateApi.bulkInitiateDonations(corporateId, data);
  }
);

export const getCorporateAnalytics = createAsyncThunk(
  'corporate/getCorporateAnalytics',
  async ({ corporateId, period }: { corporateId: string; period?: '7d' | '30d' | '90d' | '1y' }) => {
    return await CorporateApi.getCorporateAnalytics(corporateId, period);
  }
);

export const getCorporateTeam = createAsyncThunk(
  'corporate/getCorporateTeam',
  async ({ corporateId, limit, offset }: { corporateId: string; limit?: number; offset?: number }) => {
    return await CorporateApi.getCorporateTeam(corporateId, limit, offset);
  }
);

export const updateCorporateBudget = createAsyncThunk(
  'corporate/updateCorporateBudget',
  async ({ corporateId, budget }: { corporateId: string; budget: number }) => {
    return await CorporateApi.updateCorporateBudget(corporateId, budget);
  }
);

export const getCorporateDonations = createAsyncThunk(
  'corporate/getCorporateDonations',
  async ({
    corporateId,
    limit,
    offset,
    status
  }: {
    corporateId: string;
    limit?: number;
    offset?: number;
    status?: 'pending' | 'in_transit' | 'received' | 'obligated' | 'fulfilled' | 'defaulted';
  }) => {
    return await CorporateApi.getCorporateDonations(corporateId, limit, offset, status);
  }
);

export const updateCorporateVerification = createAsyncThunk(
  'corporate/updateCorporateVerification',
  async ({
    corporateId,
    isVerified,
    rejectionReason
  }: {
    corporateId: string;
    isVerified: boolean;
    rejectionReason?: string;
  }) => {
    return await CorporateApi.updateCorporateVerification(corporateId, isVerified, rejectionReason);
  }
);

export const getCorporateCSRTracking = createAsyncThunk(
  'corporate/getCorporateCSRTracking',
  async ({ corporateId, period }: { corporateId: string; period?: '30d' | '90d' | '1y' | 'all' }) => {
    return await CorporateApi.getCorporateCSRTracking(corporateId, period);
  }
);

// Slice
const corporateSlice = createSlice({
  name: 'corporate',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCorporate: (state) => {
      state.currentCorporate = null;
    },
    clearAnalytics: (state) => {
      state.analytics = null;
    },
    clearCSRTracking: (state) => {
      state.csrTracking = null;
    }
  },
  extraReducers: (builder) => {
    // Create corporate
    builder
      .addCase(createCorporate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCorporate.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCorporate = action.payload;
        state.corporates.unshift(action.payload);
      })
      .addCase(createCorporate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create corporate account';
      })

      // Get corporate
      .addCase(getCorporate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCorporate.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCorporate = action.payload;
      })
      .addCase(getCorporate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get corporate account';
      })

      // Update corporate
      .addCase(updateCorporate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCorporate.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCorporate = action.payload;
        const index = state.corporates.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.corporates[index] = action.payload;
        }
      })
      .addCase(updateCorporate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update corporate account';
      })

      // Delete corporate
      .addCase(deleteCorporate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCorporate.fulfilled, (state, action) => {
        state.loading = false;
        state.corporates = state.corporates.filter(c => c.id !== action.payload);
        if (state.currentCorporate?.id === action.payload) {
          state.currentCorporate = null;
        }
      })
      .addCase(deleteCorporate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete corporate account';
      })

      // Bulk create users
      .addCase(bulkCreateUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkCreateUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Handle bulk creation result
      })
      .addCase(bulkCreateUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to bulk create users';
      })

      // Bulk initiate donations
      .addCase(bulkInitiateDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkInitiateDonations.fulfilled, (state, action) => {
        state.loading = false;
        // Handle bulk donation result
      })
      .addCase(bulkInitiateDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to bulk initiate donations';
      })

      // Get corporate analytics
      .addCase(getCorporateAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCorporateAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getCorporateAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get corporate analytics';
      })

      // Get corporate team
      .addCase(getCorporateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCorporateTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers = action.payload;
      })
      .addCase(getCorporateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get corporate team';
      })

      // Update corporate budget
      .addCase(updateCorporateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCorporateBudget.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentCorporate) {
          state.currentCorporate.csrBudget = action.payload.csrBudget;
        }
      })
      .addCase(updateCorporateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update corporate budget';
      })

      // Get corporate donations
      .addCase(getCorporateDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCorporateDonations.fulfilled, (state, action) => {
        state.loading = false;
        state.donations = action.payload;
      })
      .addCase(getCorporateDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get corporate donations';
      })

      // Update corporate verification
      .addCase(updateCorporateVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCorporateVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCorporate = action.payload;
        const index = state.corporates.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.corporates[index] = action.payload;
        }
      })
      .addCase(updateCorporateVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update corporate verification';
      })

      // Get corporate CSR tracking
      .addCase(getCorporateCSRTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCorporateCSRTracking.fulfilled, (state, action) => {
        state.loading = false;
        state.csrTracking = action.payload;
      })
      .addCase(getCorporateCSRTracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get corporate CSR tracking';
      });
  }
});

export const {
  clearError,
  clearCurrentCorporate,
  clearAnalytics,
  clearCSRTracking
} = corporateSlice.actions;

export default corporateSlice.reducer;