import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Base Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.chaingive.ng';
const API_TIMEOUT = 30000;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      // Navigation would be handled by the app
    }
    return Promise.reject(error);
  }
);

// Charity Categories API
export const charityCategoriesApi = {
  // Get all charity categories with filters
  getCategories: async (filters?: {
    isPremium?: boolean;
    featured?: boolean;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    return apiClient.get(`/charity-categories?${params}`);
  },

  // Create new charity category (admin only)
  createCategory: async (categoryData: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/admin/charity-categories', categoryData);
  },

  // Update category progress
  updateProgress: async (categoryId: string, userId: string, amount: number): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/charity-categories/${categoryId}/progress`, {
      userId,
      amount,
    });
  },

  // Get category challenges
  getCategoryChallenges: async (categoryId: string): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    return apiClient.get(`/charity-categories/${categoryId}/challenges`);
  },

  // Join category challenge
  joinChallenge: async (challengeId: string, userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/charity-categories/challenges/${challengeId}/join`, { userId });
  },

  // Get category leaderboard
  getLeaderboard: async (categoryId: string, timeframe: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get(`/charity-categories/${categoryId}/leaderboard?timeframe=${timeframe}`);
  },

  // Toggle category featured status (admin only)
  toggleFeatured: async (categoryId: string, featured: boolean, adminId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.put(`/admin/charity-categories/${categoryId}/featured`, {
      featured,
      adminId,
    });
  },
};

// Crew API
export const crewApi = {
  // Get crews with filters
  getCrews: async (filters?: {
    categoryId?: string;
    isPublic?: boolean;
    minMembers?: number;
    maxMembers?: number;
  }): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/crews?${params}`);
  },

  // Get user's crews
  getUserCrews: async (userId: string): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    return apiClient.get(`/users/${userId}/crews`);
  },

  // Create new crew
  createCrew: async (crewData: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/crews', crewData);
  },

  // Join crew
  joinCrew: async (crewId: string, userId: string, message?: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/crews/${crewId}/join`, { userId, message });
  },

  // Leave crew
  leaveCrew: async (crewId: string, userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.delete(`/crews/${crewId}/leave`, { data: { userId } });
  },

  // Update crew settings
  updateSettings: async (crewId: string, settings: any, leaderId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.put(`/crews/${crewId}/settings`, { settings, leaderId });
  },

  // Record crew donation
  recordDonation: async (donationData: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/crews/${donationData.crewId}/donations`, donationData);
  },

  // Get crew challenges
  getChallenges: async (crewId: string): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    return apiClient.get(`/crews/${crewId}/challenges`);
  },

  // Create crew challenge
  createChallenge: async (challengeData: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/crews/${challengeData.crewId}/challenges`, challengeData);
  },

  // Join crew challenge
  joinCrewChallenge: async (challengeId: string, userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/crews/challenges/${challengeId}/join`, { userId });
  },

  // Get crew leaderboard
  getLeaderboard: async (categoryId: string, timeframe: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get(`/crews/leaderboard?categoryId=${categoryId}&timeframe=${timeframe}`);
  },

  // Distribute crew rewards
  distributeRewards: async (crewId: string, challengeId: string, leaderId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/crews/${crewId}/challenges/${challengeId}/rewards`, { leaderId });
  },
};

// Trust System API
export const trustApi = {
  // Get trust reviews with filters
  getReviews: async (filters?: {
    userId?: string;
    categoryId?: string;
    rating?: number;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<AxiosResponse<PaginatedResponse<any>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/trust/reviews?${params}`);
  },

  // Submit trust review
  submitReview: async (reviewData: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/trust/reviews', reviewData);
  },

  // Upload review video
  uploadVideo: async (formData: FormData): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/trust/reviews/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for video upload
    });
  },

  // Get user trust level
  getUserLevel: async (userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get(`/trust/users/${userId}/level`);
  },

  // Get trust challenges
  getChallenges: async (userId: string): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    return apiClient.get(`/trust/users/${userId}/challenges`);
  },

  // Get trust leaderboard
  getLeaderboard: async (timeframe: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get(`/trust/leaderboard?timeframe=${timeframe}`);
  },

  // Update trust settings
  updateSettings: async (userId: string, settings: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.put(`/trust/users/${userId}/settings`, settings);
  },

  // Vote on review helpfulness
  voteHelpful: async (reviewId: string, userId: string, isHelpful: boolean): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/trust/reviews/${reviewId}/vote`, { userId, isHelpful });
  },

  // Report review
  reportReview: async (reviewId: string, userId: string, reason: string, description?: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/trust/reviews/${reviewId}/report`, {
      userId,
      reason,
      description,
    });
  },

  // Moderate review (admin only)
  moderateReview: async (reviewId: string, moderatorId: string, action: string, reason?: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.put(`/trust/admin/reviews/${reviewId}/moderate`, {
      moderatorId,
      action,
      reason,
    });
  },
};

// Weekly Targets API
export const weeklyTargetsApi = {
  // Get current weekly target
  getCurrentTarget: async (userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get(`/weekly-targets/users/${userId}/current`);
  },

  // Generate new weekly target
  generateTarget: async (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/weekly-targets/generate', data);
  },

  // Update target progress
  updateProgress: async (targetId: string, categoryId: string, amount: number, userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/weekly-targets/${targetId}/progress`, {
      categoryId,
      amount,
      userId,
    });
  },

  // Complete weekly target
  completeTarget: async (targetId: string, userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/weekly-targets/${targetId}/complete`, { userId });
  },

  // Get target statistics
  getStats: async (userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get(`/weekly-targets/users/${userId}/stats`);
  },

  // Get leaderboard
  getLeaderboard: async (weekStart?: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    const params = weekStart ? `?weekStart=${weekStart}` : '';
    return apiClient.get(`/weekly-targets/leaderboard${params}`);
  },

  // Customize target
  customizeTarget: async (targetId: string, customizations: any, userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.put(`/weekly-targets/${targetId}/customize`, {
      customizations,
      userId,
    });
  },

  // Get AI suggestions
  getAISuggestions: async (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/weekly-targets/ai-suggestions', data);
  },

  // Skip target
  skipTarget: async (targetId: string, reason: string, userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/weekly-targets/${targetId}/skip`, { reason, userId });
  },
};

// User Levels API
export const userLevelsApi = {
  // Get user level
  getUserLevel: async (userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get(`/user-levels/${userId}`);
  },

  // Get level progress
  getProgress: async (userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get(`/user-levels/${userId}/progress`);
  },

  // Get level configuration
  getConfig: async (): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get('/user-levels/config');
  },

  // Award XP
  awardXP: async (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/user-levels/xp', data);
  },

  // Check level up
  checkLevelUp: async (userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/user-levels/${userId}/check-level-up`);
  },

  // Unlock level perk
  unlockPerk: async (userId: string, perkId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/user-levels/${userId}/perks/${perkId}/unlock`);
  },

  // Get leaderboard
  getLeaderboard: async (timeframe: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get(`/user-levels/leaderboard?timeframe=${timeframe}`);
  },

  // Get recent XP entries
  getRecentXP: async (userId: string, limit?: number): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/user-levels/${userId}/xp/recent${params}`);
  },

  // Complete milestone
  completeMilestone: async (userId: string, milestoneLevel: number): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/user-levels/${userId}/milestones/${milestoneLevel}/complete`);
  },

  // Calculate XP preview
  calculateXPPreview: async (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/user-levels/xp/preview', data);
  },
};

// Charitable NFT API
export const charitableNftApi = {
  // Get user NFTs
  getUserNFTs: async (userId: string): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    return apiClient.get(`/nfts/user/${userId}`);
  },

  // Get NFT collections
  getCollections: async (filters?: { category?: string; isActive?: boolean }): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get(`/nfts/collections?${params}`);
  },

  // Get NFT gallery
  getGallery: async (userId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.get(`/nfts/gallery/${userId}`);
  },

  // Mint NFT
  mintNFT: async (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/nfts/mint', data);
  },

  // Check eligibility
  checkEligibility: async (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/nfts/eligibility', data);
  },

  // Get marketplace
  getMarketplace: async (filters?: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    return apiClient.get(`/nfts/marketplace?${params}`);
  },

  // List NFT for sale
  listForSale: async (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/nfts/marketplace/list', data);
  },

  // Purchase NFT
  purchaseNFT: async (listingId: string, buyerId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post(`/nfts/marketplace/purchase/${listingId}`, { buyerId });
  },

  // Connect wallet
  connectWallet: async (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/nfts/wallet/connect', data);
  },

  // Get gas estimate
  getGasEstimate: async (data: any): Promise<AxiosResponse<ApiResponse<any>>> => {
    return apiClient.post('/nfts/gas-estimate', data);
  },

  // Get NFT history
  getHistory: async (nftId: string, limit?: number): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/nfts/${nftId}/history${params}`);
  },
};

// WebSocket connection for real-time updates
export class GamificationWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  constructor(private url: string, private token: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}?token=${this.token}`);

        this.ws.onopen = () => {
          console.log('Gamification WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed, attempting reconnect...');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect().catch(() => {
          // Reconnect failed, will try again
        });
      }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts));
    }
  }

  private handleMessage(data: any) {
    // Handle different message types
    switch (data.type) {
      case 'crew_progress_update':
        // Dispatch crew progress update
        break;
      case 'level_up':
        // Dispatch level up notification
        break;
      case 'nft_minted':
        // Dispatch NFT mint notification
        break;
      case 'target_completed':
        // Dispatch target completion
        break;
      case 'trust_review_submitted':
        // Dispatch trust review update
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export all APIs
export const gamificationApi = {
  charityCategories: charityCategoriesApi,
  crew: crewApi,
  trust: trustApi,
  weeklyTargets: weeklyTargetsApi,
  userLevels: userLevelsApi,
  charitableNft: charitableNftApi,
};