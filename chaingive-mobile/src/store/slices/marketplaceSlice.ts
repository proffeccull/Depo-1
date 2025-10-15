import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: 'airtime' | 'data' | 'vouchers' | 'nft' | 'premium' | 'cosmetic';
  price: number; // coins
  originalPrice?: number; // for discounts
  image: string;
  stock: number;
  sold: number;
  rating: number;
  reviews: number;
  seller: {
    id: string;
    name: string;
    verified: boolean;
  };
  tags: string[];
  featured: boolean;
  limitedTime?: boolean;
  expiresAt?: string;
  coinback?: number; // coins earned back
  createdAt: string;
}

interface AuctionItem {
  id: string;
  item: MarketplaceItem;
  startingBid: number;
  currentBid: number;
  minimumIncrement: number;
  totalBids: number;
  highestBidder?: {
    id: string;
    name: string;
  };
  auctioneer: {
    id: string;
    name: string;
    verified: boolean;
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

interface MarketplaceFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  sellerVerified?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
}

interface MarketplaceState {
  items: MarketplaceItem[];
  auctions: AuctionItem[];
  featuredItems: MarketplaceItem[];
  userBids: Bid[];
  filters: MarketplaceFilters;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  auctionsEnabled: boolean;
  lastUpdated: string | null;
}

// Initial state
const initialState: MarketplaceState = {
  items: [],
  auctions: [],
  featuredItems: [],
  userBids: [],
  filters: {},
  searchQuery: '',
  loading: false,
  error: null,
  auctionsEnabled: false,
  lastUpdated: null,
};

// Async thunks
export const fetchMarketplaceItems = createAsyncThunk(
  'marketplace/fetchItems',
  async (filters?: MarketplaceFilters) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    const response = await fetch(`/api/marketplace/items?${queryParams}`);
    return response.json();
  }
);

export const fetchAuctions = createAsyncThunk(
  'marketplace/fetchAuctions',
  async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    const response = await fetch(`/api/marketplace/auctions${query}`);
    return response.json();
  }
);

export const placeBid = createAsyncThunk(
  'marketplace/placeBid',
  async ({ auctionId, amount, userId }: {
    auctionId: string;
    amount: number;
    userId: string;
  }) => {
    const response = await fetch('/api/marketplace/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auctionId, amount, userId }),
    });
    return response.json();
  }
);

export const buyNow = createAsyncThunk(
  'marketplace/buyNow',
  async ({ auctionId, userId }: { auctionId: string; userId: string }) => {
    const response = await fetch(`/api/marketplace/auctions/${auctionId}/buy-now`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const purchaseItem = createAsyncThunk(
  'marketplace/purchaseItem',
  async ({ itemId, quantity, userId }: {
    itemId: string;
    quantity: number;
    userId: string;
  }) => {
    const response = await fetch('/api/marketplace/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity, userId }),
    });
    return response.json();
  }
);

export const createAuction = createAsyncThunk(
  'marketplace/createAuction',
  async (auctionData: {
    itemId: string;
    startingBid: number;
    reservePrice?: number;
    buyNowPrice?: number;
    duration: number; // hours
    userId: string;
  }) => {
    const response = await fetch('/api/marketplace/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auctionData),
    });
    return response.json();
  }
);

export const fetchUserBids = createAsyncThunk(
  'marketplace/fetchUserBids',
  async (userId: string) => {
    const response = await fetch(`/api/marketplace/bids/user/${userId}`);
    return response.json();
  }
);

export const toggleAuctions = createAsyncThunk(
  'marketplace/toggleAuctions',
  async ({ enabled, adminId }: { enabled: boolean; adminId: string }) => {
    const response = await fetch('/api/marketplace/admin/auctions/toggle', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, adminId }),
    });
    return response.json();
  }
);

// Slice
const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    updateItem: (state, action: PayloadAction<MarketplaceItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateAuction: (state, action: PayloadAction<AuctionItem>) => {
      const index = state.auctions.findIndex(auction => auction.id === action.payload.id);
      if (index !== -1) {
        state.auctions[index] = action.payload;
      }
    },
    addBid: (state, action: PayloadAction<Bid>) => {
      state.userBids.unshift(action.payload);
    },
    setFilters: (state, action: PayloadAction<MarketplaceFilters>) => {
      state.filters = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearMarketplaceError: (state) => {
      state.error = null;
    },
    resetMarketplaceState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch marketplace items
    builder
      .addCase(fetchMarketplaceItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMarketplaceItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.featuredItems = action.payload.featured;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMarketplaceItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch marketplace items';
      });

    // Fetch auctions
    builder
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.auctions = action.payload;
      });

    // Place bid
    builder
      .addCase(placeBid.fulfilled, (state, action) => {
        // Update auction with new bid
        const auction = state.auctions.find(a => a.id === action.payload.auctionId);
        if (auction) {
          auction.currentBid = action.payload.amount;
          auction.totalBids += 1;
          auction.highestBidder = {
            id: action.payload.bidderId,
            name: action.payload.bidderName,
          };
        }
        state.userBids.unshift(action.payload);
      });

    // Buy now
    builder
      .addCase(buyNow.fulfilled, (state, action) => {
        // Mark auction as ended with winner
        const auction = state.auctions.find(a => a.id === action.payload.auctionId);
        if (auction) {
          auction.status = 'ended';
          auction.winner = action.payload.winner;
        }
      });

    // Purchase item
    builder
      .addCase(purchaseItem.fulfilled, (state, action) => {
        // Update item stock
        const item = state.items.find(i => i.id === action.payload.itemId);
        if (item) {
          item.stock -= action.payload.quantity;
          item.sold += action.payload.quantity;
        }
      });

    // Create auction
    builder
      .addCase(createAuction.fulfilled, (state, action) => {
        state.auctions.unshift(action.payload);
      });

    // Fetch user bids
    builder
      .addCase(fetchUserBids.fulfilled, (state, action) => {
        state.userBids = action.payload;
      });

    // Toggle auctions
    builder
      .addCase(toggleAuctions.fulfilled, (state, action) => {
        state.auctionsEnabled = action.payload.enabled;
      });
  },
});

export const {
  updateItem,
  updateAuction,
  addBid,
  setFilters,
  setSearchQuery,
  clearMarketplaceError,
  resetMarketplaceState,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;