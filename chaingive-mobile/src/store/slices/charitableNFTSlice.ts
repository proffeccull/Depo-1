import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface CharitableNFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  image: string;
  animationUrl?: string;
  attributes: NFTAttribute[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  category: string;
  milestone: string;
  earnedBy: string; // User ID
  earnedAt: string;
  blockchain: 'polygon' | 'ethereum' | 'bsc';
  isSoulbound: boolean; // Cannot be transferred
  metadata: NFTMetadata;
  achievements: NFTAchievement[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
  max_value?: number;
}

export interface NFTMetadata {
  external_url?: string;
  background_color?: string;
  youtube_url?: string;
  animation_details?: {
    format: string;
    duration: number;
  };
}

export interface NFTAchievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'donation' | 'streak' | 'crew' | 'trust' | 'level';
}

export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  image: string;
  coverImage?: string;
  totalSupply: number;
  currentSupply: number;
  floorPrice?: number;
  volume24h?: number;
  category: string;
  isActive: boolean;
  launchDate: string;
  contractAddress: string;
  blockchain: 'polygon' | 'ethereum' | 'bsc';
}

export interface NFTMintRequest {
  id: string;
  userId: string;
  achievementId: string;
  collectionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionHash?: string;
  tokenId?: string;
  gasEstimate?: number;
  requestedAt: string;
  completedAt?: string;
  error?: string;
}

export interface NFTGallery {
  userId: string;
  ownedNFTs: CharitableNFT[];
  collections: NFTCollection[];
  totalValue?: number;
  rarestNFT?: CharitableNFT;
  recentMints: CharitableNFT[];
  achievements: NFTAchievement[];
  stats: NFTStats;
}

export interface NFTStats {
  totalOwned: number;
  totalCollections: number;
  rarestRarity: string;
  totalValue: number;
  averageRarity: number;
  completionRate: number; // Percentage of available NFTs owned
  uniqueAchievements: number;
  mintStreak: number;
}

export interface NFTMarketplace {
  listings: NFTListing[];
  collections: NFTCollection[];
  trending: NFTCollection[];
  recentSales: NFTSale[];
  floorPrices: { [collectionId: string]: number };
  volume24h: number;
  totalVolume: number;
}

export interface NFTListing {
  id: string;
  nftId: string;
  sellerId: string;
  price: number;
  currency: 'MATIC' | 'ETH' | 'BNB' | 'USD';
  listedAt: string;
  expiresAt?: string;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  collectionId: string;
}

export interface NFTSale {
  id: string;
  nftId: string;
  sellerId: string;
  buyerId: string;
  price: number;
  currency: 'MATIC' | 'ETH' | 'BNB' | 'USD';
  transactionHash: string;
  soldAt: string;
  marketplaceFee: number;
  royaltyFee: number;
}

export interface NFTWallet {
  address: string;
  balance: { [currency: string]: number };
  network: 'polygon' | 'ethereum' | 'bsc';
  isConnected: boolean;
  pendingTransactions: string[];
  gasPrice: number;
}

interface CharitableNFTState {
  userNFTs: CharitableNFT[];
  collections: NFTCollection[];
  gallery: NFTGallery | null;
  marketplace: NFTMarketplace | null;
  wallet: NFTWallet | null;
  mintRequests: NFTMintRequest[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Initial state
const initialState: CharitableNFTState = {
  userNFTs: [],
  collections: [],
  gallery: null,
  marketplace: null,
  wallet: null,
  mintRequests: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchUserNFTs = createAsyncThunk(
  'charitableNFT/fetchUserNFTs',
  async (userId: string) => {
    const response = await fetch(`/api/nfts/user/${userId}`);
    return response.json();
  }
);

export const fetchNFTCollections = createAsyncThunk(
  'charitableNFT/fetchCollections',
  async (filters?: { category?: string; isActive?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(`/api/nfts/collections?${queryParams}`);
    return response.json();
  }
);

export const fetchNFTGallery = createAsyncThunk(
  'charitableNFT/fetchGallery',
  async (userId: string) => {
    const response = await fetch(`/api/nfts/gallery/${userId}`);
    return response.json();
  }
);

export const mintCharitableNFT = createAsyncThunk(
  'charitableNFT/mintNFT',
  async ({ userId, achievementId, collectionId }: {
    userId: string;
    achievementId: string;
    collectionId: string;
  }) => {
    const response = await fetch('/api/nfts/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, achievementId, collectionId }),
    });
    return response.json();
  }
);

export const checkNFTEligibility = createAsyncThunk(
  'charitableNFT/checkEligibility',
  async ({ userId, achievementId }: { userId: string; achievementId: string }) => {
    const response = await fetch('/api/nfts/eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, achievementId }),
    });
    return response.json();
  }
);

export const fetchNFTMarketplace = createAsyncThunk(
  'charitableNFT/fetchMarketplace',
  async (filters?: { collection?: string; rarity?: string; priceRange?: [number, number] }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    const response = await fetch(`/api/nfts/marketplace?${queryParams}`);
    return response.json();
  }
);

export const listNFTForSale = createAsyncThunk(
  'charitableNFT/listForSale',
  async ({ nftId, price, currency, expiresAt }: {
    nftId: string;
    price: number;
    currency: 'MATIC' | 'ETH' | 'BNB' | 'USD';
    expiresAt?: string;
  }) => {
    const response = await fetch('/api/nfts/marketplace/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nftId, price, currency, expiresAt }),
    });
    return response.json();
  }
);

export const purchaseNFT = createAsyncThunk(
  'charitableNFT/purchaseNFT',
  async ({ listingId, buyerId }: { listingId: string; buyerId: string }) => {
    const response = await fetch(`/api/nfts/marketplace/purchase/${listingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerId }),
    });
    return response.json();
  }
);

export const connectNFTWallet = createAsyncThunk(
  'charitableNFT/connectWallet',
  async ({ address, network }: { address: string; network: 'polygon' | 'ethereum' | 'bsc' }) => {
    const response = await fetch('/api/nfts/wallet/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, network }),
    });
    return response.json();
  }
);

export const getGasEstimate = createAsyncThunk(
  'charitableNFT/getGasEstimate',
  async ({ action, network }: {
    action: 'mint' | 'transfer' | 'list' | 'purchase';
    network: 'polygon' | 'ethereum' | 'bsc';
  }) => {
    const response = await fetch('/api/nfts/gas-estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, network }),
    });
    return response.json();
  }
);

export const fetchNFTHistory = createAsyncThunk(
  'charitableNFT/fetchHistory',
  async ({ nftId, limit }: { nftId: string; limit?: number }) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(`/api/nfts/${nftId}/history${params}`);
    return response.json();
  }
);

// Slice
const charitableNFTSlice = createSlice({
  name: 'charitableNFT',
  initialState,
  reducers: {
    updateUserNFTs: (state, action: PayloadAction<CharitableNFT[]>) => {
      state.userNFTs = action.payload;
    },
    addUserNFT: (state, action: PayloadAction<CharitableNFT>) => {
      state.userNFTs.push(action.payload);
    },
    updateNFTCollections: (state, action: PayloadAction<NFTCollection[]>) => {
      state.collections = action.payload;
    },
    updateNFTGallery: (state, action: PayloadAction<NFTGallery>) => {
      state.gallery = action.payload;
    },
    updateNFTMarketplace: (state, action: PayloadAction<NFTMarketplace>) => {
      state.marketplace = action.payload;
    },
    updateNFTWallet: (state, action: PayloadAction<NFTWallet>) => {
      state.wallet = action.payload;
    },
    addMintRequest: (state, action: PayloadAction<NFTMintRequest>) => {
      state.mintRequests.push(action.payload);
    },
    updateMintRequest: (state, action: PayloadAction<NFTMintRequest>) => {
      const index = state.mintRequests.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.mintRequests[index] = action.payload;
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
        state.userNFTs = action.payload.nfts;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserNFTs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch NFTs';
      });

    // Fetch NFT collections
    builder
      .addCase(fetchNFTCollections.fulfilled, (state, action) => {
        state.collections = action.payload.collections;
      });

    // Fetch NFT gallery
    builder
      .addCase(fetchNFTGallery.fulfilled, (state, action) => {
        state.gallery = action.payload.gallery;
      });

    // Mint charitable NFT
    builder
      .addCase(mintCharitableNFT.fulfilled, (state, action) => {
        state.userNFTs.push(action.payload.nft);
        state.mintRequests.push(action.payload.mintRequest);
      });

    // Check NFT eligibility
    builder
      .addCase(checkNFTEligibility.fulfilled, (state, action) => {
        // Update eligibility status - handled in component
      });

    // Fetch NFT marketplace
    builder
      .addCase(fetchNFTMarketplace.fulfilled, (state, action) => {
        state.marketplace = action.payload.marketplace;
      });

    // List NFT for sale
    builder
      .addCase(listNFTForSale.fulfilled, (state, action) => {
        if (state.marketplace) {
          state.marketplace.listings.push(action.payload.listing);
        }
      });

    // Purchase NFT
    builder
      .addCase(purchaseNFT.fulfilled, (state, action) => {
        // Update listings and user NFTs
        if (state.marketplace) {
          const listingIndex = state.marketplace.listings.findIndex(l => l.id === action.payload.listingId);
          if (listingIndex !== -1) {
            state.marketplace.listings[listingIndex].status = 'sold';
          }
        }
        // Add NFT to user's collection
        state.userNFTs.push(action.payload.nft);
      });

    // Connect NFT wallet
    builder
      .addCase(connectNFTWallet.fulfilled, (state, action) => {
        state.wallet = action.payload.wallet;
      });

    // Get gas estimate
    builder
      .addCase(getGasEstimate.fulfilled, (state, action) => {
        if (state.wallet) {
          state.wallet.gasPrice = action.payload.gasPrice;
        }
      });

    // Fetch NFT history
    builder
      .addCase(fetchNFTHistory.fulfilled, (state, action) => {
        // History is handled in component state
      });
  },
});

export const {
  updateUserNFTs,
  addUserNFT,
  updateNFTCollections,
  updateNFTGallery,
  updateNFTMarketplace,
  updateNFTWallet,
  addMintRequest,
  updateMintRequest,
  clearNFTError,
  resetNFTState,
} = charitableNFTSlice.actions;

export default charitableNFTSlice.reducer;