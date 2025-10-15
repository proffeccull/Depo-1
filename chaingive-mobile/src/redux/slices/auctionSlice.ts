import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../api/client';

interface AuctionItem {
  id: string;
  item: {
    id: string;
    name: string;
    description: string;
    category: string;
    image: string;
  };
  startingBid: number;
  currentBid: number;
  minimumIncrement: number;
  totalBids: number;
  highestBidder?: {
    id: string;
    name: string;
    profilePictureUrl?: string;
  };
  auctioneer: {
    id: string;
    name: string;
    verified: boolean;
    profilePictureUrl?: string;
  };
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  winner?: {
    id: string;
    name: string;
    bidAmount: number;
  };
  reservePrice?: number;
  buyNowPrice?: number;
  category: string;
  featured: boolean;
  views: number;
  watchers: number;
  isWatched?: boolean;
}

interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
  autoBid?: boolean;
  maxAutoBid?: number;
}

interface AuctionFilters {
  category?: string;
  status?: 'upcoming' | 'active' | 'ended';
  priceRange?: { min: number; max: number };
  featured?: boolean;
  sortBy?: 'ending_soon' | 'newest' | 'price_low' | 'price_high' | 'popular';
}

interface AuctionStats {
  totalAuctions: number;
  activeAuctions: number;
  totalBids: number;
  totalValue: number;
  userParticipation: number;
}

interface AuctionState {
  auctions: AuctionItem[];
  userAuctions: AuctionItem[];
  userBids: Bid[];
  userWatched: AuctionItem[];
  currentAuction: AuctionItem | null;
  bidHistory: Bid[];
  filters: AuctionFilters;
  stats: AuctionStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: AuctionState = {
  auctions: [],
  userAuctions: [],
  userBids: [],
  userWatched: [],
  currentAuction: null,
  bidHistory: [],
  filters: {
    status: 'active',
    sortBy: 'ending_soon'
  },
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchAuctions = createAsyncThunk(
  'auction/fetchAuctions',
  async (filters?: AuctionFilters) => {
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
    const response = await apiClient.get(`/marketplace/auctions?${params}`);
    return response.data.data;
  }
);

export const fetchAuctionDetails = createAsyncThunk(
  'auction/fetchAuctionDetails',
  async (auctionId: string) => {
    const response = await apiClient.get(`/marketplace/auctions/${auctionId}`);
    return response.data.data;
  }
);

export const placeBid = createAsyncThunk(
  'auction/placeBid',
  async ({ auctionId, amount, autoBid, maxAutoBid }: {
    auctionId: string;
    amount: number;
    autoBid?: boolean;
    maxAutoBid?: number;
  }) => {
    const response = await apiClient.post(`/marketplace/auctions/${auctionId}/bid`, {
      amount,
      autoBid,
      maxAutoBid
    });
    return response.data.data;
  }
);

export const buyNow = createAsyncThunk(
  'auction/buyNow',
  async (auctionId: string) => {
    const response = await apiClient.post(`/marketplace/auctions/${auctionId}/buy-now`);
    return response.data.data;
  }
);

export const createAuction = createAsyncThunk(
  'auction/createAuction',
  async (auctionData: {
    itemId: string;
    startingBid: number;
    reservePrice?: number;
    buyNowPrice?: number;
    duration: number;
    category: string;
    featured?: boolean;
  }) => {
    const response = await apiClient.post('/marketplace/auctions', auctionData);
    return response.data.data;
  }
);

export const watchAuction = createAsyncThunk(
  'auction/watchAuction',
  async (auctionId: string) => {
    const response = await apiClient.post(`/marketplace/auctions/${auctionId}/watch`);
    return response.data.data;
  }
);

export const unwatchAuction = createAsyncThunk(
  'auction/unwatchAuction',
  async (auctionId: string) => {
    await apiClient.delete(`/marketplace/auctions/${auctionId}/watch`);
    return auctionId;
  }
);

export const fetchUserAuctions = createAsyncThunk(
  'auction/fetchUserAuctions',
  async (userId: string) => {
    const response = await apiClient.get(`/marketplace/auctions/user/${userId}`);
    return response.data.data;
  }
);

export const fetchUserBids = createAsyncThunk(
  'auction/fetchUserBids',
  async (userId: string) => {
    const response = await apiClient.get(`/marketplace/bids/user/${userId}`);
    return response.data.data;
  }
);

export const fetchBidHistory = createAsyncThunk(
  'auction/fetchBidHistory',
  async (auctionId: string) => {
    const response = await apiClient.get(`/marketplace/auctions/${auctionId}/bids`);
    return response.data.data;
  }
);

export const fetchWatchedAuctions = createAsyncThunk(
  'auction/fetchWatchedAuctions',
  async (userId: string) => {
    const response = await apiClient.get(`/marketplace/auctions/watched/${userId}`);
    return response.data.data;
  }
);

export const fetchAuctionStats = createAsyncThunk(
  'auction/fetchAuctionStats',
  async (userId: string) => {
    const response = await apiClient.get(`/marketplace/auctions/stats/${userId}`);
    return response.data.data;
  }
);

// Slice
const auctionSlice = createSlice({
  name: 'auction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<AuctionFilters>) => {
      state.filters = action.payload;
    },
    clearCurrentAuction: (state) => {
      state.currentAuction = null;
    },
    updateAuctionLocally: (state, action: PayloadAction<{ id: string; updates: Partial<AuctionItem> }>) => {
      const { id, updates } = action.payload;
      const index = state.auctions.findIndex(auction => auction.id === id);
      if (index !== -1) {
        state.auctions[index] = { ...state.auctions[index], ...updates };
      }
      if (state.currentAuction?.id === id) {
        state.currentAuction = { ...state.currentAuction, ...updates };
      }
      const userIndex = state.userAuctions.findIndex(auction => auction.id === id);
      if (userIndex !== -1) {
        state.userAuctions[userIndex] = { ...state.userAuctions[userIndex], ...updates };
      }
    },
    addNewBid: (state, action: PayloadAction<Bid>) => {
      state.userBids.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    // Fetch auctions
    builder
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch auctions';
      })

      // Fetch auction details
      .addCase(fetchAuctionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAuction = action.payload;
        // Update in auctions list if exists
        const index = state.auctions.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.auctions[index] = action.payload;
        }
      })
      .addCase(fetchAuctionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch auction details';
      })

      // Place bid
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.loading = false;
        // Update auction with new bid
        const auction = state.auctions.find(a => a.id === action.payload.auctionId);
        if (auction) {
          auction.currentBid = action.payload.amount;
          auction.totalBids += 1;
          auction.highestBidder = action.payload.bidder;
        }
        if (state.currentAuction && state.currentAuction.id === action.payload.auctionId) {
          state.currentAuction.currentBid = action.payload.amount;
          state.currentAuction.totalBids += 1;
          state.currentAuction.highestBidder = action.payload.bidder;
        }
        state.userBids.unshift(action.payload);
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to place bid';
      })

      // Buy now
      .addCase(buyNow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyNow.fulfilled, (state, action) => {
        state.loading = false;
        // Mark auction as ended with winner
        const auction = state.auctions.find(a => a.id === action.payload.auctionId);
        if (auction) {
          auction.status = 'ended';
          auction.winner = action.payload.winner;
        }
        if (state.currentAuction && state.currentAuction.id === action.payload.auctionId) {
          state.currentAuction.status = 'ended';
          state.currentAuction.winner = action.payload.winner;
        }
      })
      .addCase(buyNow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to buy now';
      })

      // Create auction
      .addCase(createAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAuction.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions.unshift(action.payload);
        state.userAuctions.unshift(action.payload);
      })
      .addCase(createAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create auction';
      })

      // Watch auction
      .addCase(watchAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(watchAuction.fulfilled, (state, action) => {
        state.loading = false;
        const auction = state.auctions.find(a => a.id === action.payload.id);
        if (auction) {
          auction.isWatched = true;
          auction.watchers += 1;
        }
        if (state.currentAuction && state.currentAuction.id === action.payload.id) {
          state.currentAuction.isWatched = true;
          state.currentAuction.watchers += 1;
        }
        state.userWatched.unshift(action.payload);
      })
      .addCase(watchAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to watch auction';
      })

      // Unwatch auction
      .addCase(unwatchAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unwatchAuction.fulfilled, (state, action) => {
        state.loading = false;
        const auction = state.auctions.find(a => a.id === action.payload);
        if (auction) {
          auction.isWatched = false;
          auction.watchers = Math.max(0, auction.watchers - 1);
        }
        if (state.currentAuction?.id === action.payload) {
          state.currentAuction.isWatched = false;
          state.currentAuction.watchers = Math.max(0, state.currentAuction.watchers - 1);
        }
        state.userWatched = state.userWatched.filter(a => a.id !== action.payload);
      })
      .addCase(unwatchAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to unwatch auction';
      })

      // Fetch user auctions
      .addCase(fetchUserAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.userAuctions = action.payload;
      })
      .addCase(fetchUserAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user auctions';
      })

      // Fetch user bids
      .addCase(fetchUserBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBids.fulfilled, (state, action) => {
        state.loading = false;
        state.userBids = action.payload;
      })
      .addCase(fetchUserBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user bids';
      })

      // Fetch bid history
      .addCase(fetchBidHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.bidHistory = action.payload;
      })
      .addCase(fetchBidHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bid history';
      })

      // Fetch watched auctions
      .addCase(fetchWatchedAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchedAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.userWatched = action.payload;
      })
      .addCase(fetchWatchedAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch watched auctions';
      })

      // Fetch auction stats
      .addCase(fetchAuctionStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAuctionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch auction stats';
      });
  }
});

export const {
  clearError,
  setFilters,
  clearCurrentAuction,
  updateAuctionLocally,
  addNewBid
} = auctionSlice.actions;

export default auctionSlice.reducer;