import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SocialApi } from '../../api/social';
import {
  SocialCircle,
  CircleMember,
  CreateCircleRequest
} from '../../types/social';

interface CircleFilters {
  category?: string;
  privacy?: 'public' | 'private';
  memberCount?: { min: number; max: number };
  sortBy?: 'newest' | 'popular' | 'active';
}

interface CircleStats {
  totalCircles: number;
  userCircles: number;
  totalMembers: number;
  activeDiscussions: number;
}

interface CirclesState {
  circles: SocialCircle[];
  userCircles: SocialCircle[];
  discoveredCircles: SocialCircle[];
  currentCircle: SocialCircle | null;
  circleMembers: CircleMember[];
  filters: CircleFilters;
  stats: CircleStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: CirclesState = {
  circles: [],
  userCircles: [],
  discoveredCircles: [],
  currentCircle: null,
  circleMembers: [],
  filters: {
    sortBy: 'popular'
  },
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchCircles = createAsyncThunk(
  'circles/fetchCircles',
  async (filters?: CircleFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    // Note: This would need to be implemented in SocialApi
    const response = await fetch(`/api/social/circles/discover?${params}`);
    return response.json();
  }
);

export const fetchUserCircles = createAsyncThunk(
  'circles/fetchUserCircles',
  async () => {
    return await SocialApi.getUserCircles();
  }
);

export const createCircle = createAsyncThunk(
  'circles/createCircle',
  async (circleData: CreateCircleRequest) => {
    return await SocialApi.createCircle(circleData);
  }
);

export const fetchCircleDetails = createAsyncThunk(
  'circles/fetchCircleDetails',
  async (circleId: string) => {
    return await SocialApi.getCircle(circleId);
  }
);

export const updateCircle = createAsyncThunk(
  'circles/updateCircle',
  async ({ circleId, updates }: { circleId: string; updates: Partial<CreateCircleRequest> }) => {
    const updatedCircle = await SocialApi.updateCircle(circleId, updates);
    return { circleId, updates: updatedCircle };
  }
);

export const deleteCircle = createAsyncThunk(
  'circles/deleteCircle',
  async (circleId: string) => {
    await SocialApi.deleteCircle(circleId);
    return circleId;
  }
);

export const joinCircle = createAsyncThunk(
  'circles/joinCircle',
  async (circleId: string) => {
    return await SocialApi.joinCircle(circleId);
  }
);

export const leaveCircle = createAsyncThunk(
  'circles/leaveCircle',
  async (circleId: string) => {
    await SocialApi.leaveCircle(circleId);
    return circleId;
  }
);

export const fetchCircleMembers = createAsyncThunk(
  'circles/fetchCircleMembers',
  async ({ circleId, limit, offset }: { circleId: string; limit?: number; offset?: number }) => {
    return await SocialApi.getCircleMembers(circleId, limit, offset);
  }
);

export const inviteToCircle = createAsyncThunk(
  'circles/inviteToCircle',
  async ({ circleId, userIds }: { circleId: string; userIds: string[] }) => {
    const response = await fetch(`/api/social/circles/${circleId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds }),
    });
    return response.json();
  }
);

export const searchCircles = createAsyncThunk(
  'circles/searchCircles',
  async (query: string) => {
    const response = await fetch(`/api/social/circles/search?q=${encodeURIComponent(query)}`);
    return response.json();
  }
);

export const fetchCircleStats = createAsyncThunk(
  'circles/fetchCircleStats',
  async (userId: string) => {
    const response = await fetch(`/api/social/circles/stats/${userId}`);
    return response.json();
  }
);

// Slice
const circlesSlice = createSlice({
  name: 'circles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<CircleFilters>) => {
      state.filters = action.payload;
    },
    clearCurrentCircle: (state) => {
      state.currentCircle = null;
    },
    updateCircleLocally: (state, action: PayloadAction<{ id: string; updates: Partial<SocialCircle> }>) => {
      const { id, updates } = action.payload;
      const index = state.circles.findIndex(circle => circle.id === id);
      if (index !== -1) {
        state.circles[index] = { ...state.circles[index], ...updates };
      }
      if (state.currentCircle?.id === id) {
        state.currentCircle = { ...state.currentCircle, ...updates };
      }
      const userIndex = state.userCircles.findIndex(circle => circle.id === id);
      if (userIndex !== -1) {
        state.userCircles[userIndex] = { ...state.userCircles[userIndex], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch circles
    builder
      .addCase(fetchCircles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCircles.fulfilled, (state, action) => {
        state.loading = false;
        state.discoveredCircles = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCircles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch circles';
      })

      // Fetch user circles
      .addCase(fetchUserCircles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCircles.fulfilled, (state, action) => {
        state.loading = false;
        state.userCircles = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserCircles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user circles';
      })

      // Create circle
      .addCase(createCircle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCircle.fulfilled, (state, action) => {
        state.loading = false;
        state.userCircles.unshift(action.payload);
        state.circles.unshift(action.payload);
      })
      .addCase(createCircle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create circle';
      })

      // Fetch circle details
      .addCase(fetchCircleDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCircleDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCircle = action.payload;
        // Update in circles list if exists
        const index = state.circles.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.circles[index] = action.payload;
        }
      })
      .addCase(fetchCircleDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch circle details';
      })

      // Update circle
      .addCase(updateCircle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCircle.fulfilled, (state, action) => {
        state.loading = false;
        const { circleId, updates } = action.payload;
        // Update in all relevant lists
        const circleIndex = state.circles.findIndex(c => c.id === circleId);
        if (circleIndex !== -1) {
          state.circles[circleIndex] = updates;
        }
        const userIndex = state.userCircles.findIndex(c => c.id === circleId);
        if (userIndex !== -1) {
          state.userCircles[userIndex] = updates;
        }
        if (state.currentCircle?.id === circleId) {
          state.currentCircle = updates;
        }
      })
      .addCase(updateCircle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update circle';
      })

      // Delete circle
      .addCase(deleteCircle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCircle.fulfilled, (state, action) => {
        state.loading = false;
        state.circles = state.circles.filter(c => c.id !== action.payload);
        state.userCircles = state.userCircles.filter(c => c.id !== action.payload);
        if (state.currentCircle?.id === action.payload) {
          state.currentCircle = null;
        }
      })
      .addCase(deleteCircle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete circle';
      })

      // Join circle
      .addCase(joinCircle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinCircle.fulfilled, (state, action) => {
        state.loading = false;
        // Update member count
        const circle = state.circles.find(c => c.id === action.meta.arg);
        if (circle) {
          circle.memberCount += 1;
        }
        if (state.currentCircle?.id === action.meta.arg) {
          state.currentCircle.memberCount += 1;
        }
        state.circleMembers.push(action.payload);
      })
      .addCase(joinCircle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to join circle';
      })

      // Leave circle
      .addCase(leaveCircle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveCircle.fulfilled, (state, action) => {
        state.loading = false;
        // Update member count
        const circle = state.circles.find(c => c.id === action.payload);
        if (circle) {
          circle.memberCount = Math.max(0, circle.memberCount - 1);
        }
        if (state.currentCircle?.id === action.payload) {
          state.currentCircle.memberCount = Math.max(0, state.currentCircle.memberCount - 1);
        }
        state.circleMembers = state.circleMembers.filter(m => m.circleId !== action.payload);
      })
      .addCase(leaveCircle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to leave circle';
      })

      // Fetch circle members
      .addCase(fetchCircleMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCircleMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.circleMembers = action.payload;
      })
      .addCase(fetchCircleMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch circle members';
      })

      // Invite to circle
      .addCase(inviteToCircle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteToCircle.fulfilled, (state, action) => {
        state.loading = false;
        // Handle invitation success
      })
      .addCase(inviteToCircle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send invitations';
      })

      // Search circles
      .addCase(searchCircles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCircles.fulfilled, (state, action) => {
        state.loading = false;
        state.discoveredCircles = action.payload;
      })
      .addCase(searchCircles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search circles';
      })

      // Fetch circle stats
      .addCase(fetchCircleStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCircleStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCircleStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch circle stats';
      });
  }
});

export const {
  clearError,
  setFilters,
  clearCurrentCircle,
  updateCircleLocally
} = circlesSlice.actions;

export default circlesSlice.reducer;