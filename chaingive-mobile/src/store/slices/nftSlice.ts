import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface NFTAchievement {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  image: string;
  animation?: string;
  attributes: NFTAttribute[];
  achievementId: string; // Links to gamification achievement
  mintedAt: string;
  mintTxHash?: string;
  tokenId?: string;
  contractAddress?: string;
  blockchain: 'polygon' | 'ethereum' | 'bsc';
  ownerId: string;
  isListed: boolean;
  listingPrice?: number;
  collection: string;
  serialNumber: number;
  totalSupply: number;
}

interface NFTAttribute {
  trait_type: string;
  value: string;
  rarity?: number;
}

interface NFTCollection {
  id: string;
  name: string;
  description: string;
  image: string;
  coverImage?: string;
  totalSupply: number;
  mintedCount: number;
  floorPrice?: number;
  volume24h?: number;
  isActive: boolean;
  creatorId: string;
  createdAt: string;
}

interface NFTListing {
  id: string;
  nftId: string;
  sellerId: string;
  price: number;
  currency: 'coins' | 'matic' | 'eth' | 'bnb';
  listedAt: string;
  expiresAt?: string;
  isActive: boolean;
  bids: NFTBid[];
}

interface NFTBid {
  id: string;
  listingId: string;
  bidderId: string;
  amount: number;
  currency: 'coins' | 'matic' | 'eth' | 'bnb';
  bidAt: string;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
}

interface NFTWallet {
  address: string;
  balance: {
    matic: number;
    eth: number;
    bnb: number;
    coins: number;
  };
  nfts: NFTAchievement[];
  transactions: NFTTransaction[];
}

interface NFTTransaction {
  id: string;
  type: 'mint' | 'transfer' | 'sale' | 'purchase' | 'bid';
  nftId?: string;
  fromAddress?: string;
  toAddress?: string;
  amount: number;
  currency: 'coins' | 'matic' | 'eth' | 'bnb';
  txHash?: string;
  blockNumber?: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface NFTState {
  achievements: NFTAchievement[];
  collections: NFTCollection[];
  listings: NFTListing[];
  wallet: NFTWallet | null;
  featuredNFTs: NFTAchievement[];
  loading: boolean;
  error: string | null;
  blockchainEnabled: boolean;
  lastUpdated: string | null;
}

// Initial state
const initialState: NFTState = {
  achievements: [],
  collections: [],
  listings: [],
  wallet: null,
  featuredNFTs: [],
  loading: false,
  error: null,
  blockchainEnabled: false,
  lastUpdated: null,
};

// Async thunks
export const fetchUserNFTs = createAsyncThunk(
  'nft/fetchUserNFTs',
  async (userId: string) => {
    const response = await fetch(`/api/nft/user/${userId}`);
    return response.json();
  }
);

export const fetchNFTCollections = createAsyncThunk(
  'nft/fetchCollections',
  async () => {
    const response = await fetch('/api/nft/collections');
    return response.json();
  }
);

export const mintNFTAchievement = createAsyncThunk(
  'nft/mintAchievement',
  async ({
    achievementId,
    userId,
    blockchain = 'polygon'
  }: {
    achievementId: string;
    userId: string;
    blockchain?: 'polygon' | 'ethereum' | 'bsc';
  }) => {
    const response = await fetch('/api/nft/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievementId, userId, blockchain }),
    });
    return response.json();
  }
);

export const listNFTForSale = createAsyncThunk(
  'nft/listForSale',
  async ({
    nftId,
    price,
    currency = 'coins',
    userId
  }: {
    nftId: string;
    price: number;
    currency?: 'coins' | 'matic' | 'eth' | 'bnb';
    userId: string;
  }) => {
    const response = await fetch('/api/nft/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nftId, price, currency, userId }),
    });
    return response.json();
  }
);

export const placeNFTBid = createAsyncThunk(
  'nft/placeBid',
  async ({
    listingId,
    amount,
    currency = 'coins',
    userId
  }: {
    listingId: string;
    amount: number;
    currency?: 'coins' | 'matic' | 'eth' | 'bnb';
    userId: string;
  }) => {
    const response = await fetch('/api/nft/bid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, amount, currency, userId }),
    });
    return response.json();
  }
);

export const purchaseNFT = createAsyncThunk(
  'nft/purchaseNFT',
  async ({
    listingId,
    userId
  }: {
    listingId: string;
    userId: string;
  }) => {
    const response = await fetch(`/api/nft/purchase/${listingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }
);

export const transferNFT = createAsyncThunk(
  'nft/transferNFT',
  async ({
    nftId,
    toAddress,
    userId
  }: {
    nftId: string;
    toAddress: string;
    userId: string;
  }) => {
    const response = await fetch('/api/nft/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nftId, toAddress, userId }),
    });
    return response.json();
  }
);

export const fetchNFTMarketplace = createAsyncThunk(
  'nft/fetchMarketplace',
  async (filters?: {
    collection?: string;
    rarity?: string;
    priceRange?: { min: number; max: number };
    sortBy?: 'price_asc' | 'price_desc' | 'rarity' | 'newest';
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
    }
    const response = await fetch(`/api/nft/marketplace?${queryParams}`);
    return response.json();
  }
);

export const toggleBlockchainFeatures = createAsyncThunk(
  'nft/toggleBlockchain',
  async ({ enabled, adminId }: { enabled: boolean; adminId: string }) => {
    const response = await fetch('/api/admin/nft/toggle-blockchain', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, adminId }),
    });
    return response.json();
  }
);

export const fetchNFTWallet = createAsyncThunk(
  'nft/fetchWallet',
  async (userId: string) => {
    const response = await fetch(`/api/nft/wallet/${userId}`);
    return response.json();
  }
);

// Slice
const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    updateNFT: (state, action: PayloadAction<NFTAchievement>) => {
      const index = state.achievements.findIndex(nft => nft.id === action.payload.id);
      if (index !== -1) {
        state.achievements[index] = action.payload;
      }
    },
    addNFT: (state, action: PayloadAction<NFTAchievement>) => {
      state.achievements.unshift(action.payload);
    },
    updateListing: (state, action: PayloadAction<NFTListing>) => {
      const index = state.listings.findIndex(listing => listing.id === action.payload.id);
      if (index !== -1) {
        state.listings[index] = action.payload;
      }
    },
    addBid: (state, action: PayloadAction<NFTBid>) => {
      const listing = state.listings.find(l => l.id === action.payload.listingId);
      if (listing) {
        listing.bids.push(action.payload);
      }
    },
    updateWallet: (state, action: PayloadAction<Partial<NFTWallet>>) => {
      if (state.wallet) {
        state.wallet = { ...state.wallet, ...action.payload };
      }
    },
    clearNFTError: (state) => {
      state.error = null;
    },
    resetNFTState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch user NFTs
    builder
      .addCase(fetchUserNFTs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserNFTs.fulfilled, (state, action) => {
        state.loading = false;
        state.achievements = action.payload.nfts;
        state.wallet = action.payload.wallet;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserNFTs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch NFTs';
      });

    // Fetch NFT collections
    builder
      .addCase(fetchNFTCollections.fulfilled, (state, action) => {
        state.collections = action.payload;
      });

    // Mint NFT achievement
    builder
      .addCase(mintNFTAchievement.fulfilled, (state, action) => {
        state.achievements.unshift(action.payload.nft);
        if (state.wallet) {
          state.wallet.nfts.unshift(action.payload.nft);
          state.wallet.transactions.unshift(action.payload.transaction);
        }
      });

    // List NFT for sale
    builder
      .addCase(listNFTForSale.fulfilled, (state, action) => {
        state.listings.push(action.payload.listing);
        // Update NFT as listed
        const nft = state.achievements.find(n => n.id === action.payload.nftId);
        if (nft) {
          nft.isListed = true;
          nft.listingPrice = action.payload.price;
        }
      });

    // Place NFT bid
    builder
      .addCase(placeNFTBid.fulfilled, (state, action) => {
        const listing = state.listings.find(l => l.id === action.payload.listingId);
        if (listing) {
          listing.bids.push(action.payload.bid);
        }
      });

    // Purchase NFT
    builder
      .addCase(purchaseNFT.fulfilled, (state, action) => {
        // Update NFT ownership
        const nftIndex = state.achievements.findIndex(n => n.id === action.payload.nftId);
        if (nftIndex !== -1) {
          state.achievements[nftIndex].ownerId = action.payload.newOwnerId;
          state.achievements[nftIndex].isListed = false;
        }
        // Remove listing
        state.listings = state.listings.filter(l => l.id !== action.payload.listingId);
      });

    // Transfer NFT
    builder
      .addCase(transferNFT.fulfilled, (state, action) => {
        const nft = state.achievements.find(n => n.id === action.payload.nftId);
        if (nft) {
          nft.ownerId = action.payload.toAddress;
        }
      });

    // Fetch NFT marketplace
    builder
      .addCase(fetchNFTMarketplace.fulfilled, (state, action) => {
        state.listings = action.payload.listings;
        state.featuredNFTs = action.payload.featured;
      });

    // Toggle blockchain features
    builder
      .addCase(toggleBlockchainFeatures.fulfilled, (state, action) => {
        state.blockchainEnabled = action.payload.enabled;
      });

    // Fetch NFT wallet
    builder
      .addCase(fetchNFTWallet.fulfilled, (state, action) => {
        state.wallet = action.payload;
      });
  },
});

export const {
  updateNFT,
  addNFT,
  updateListing,
  addBid,
  updateWallet,
  clearNFTError,
  resetNFTState,
} = nftSlice.actions;

export default nftSlice.reducer;