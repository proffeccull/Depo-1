import axios from 'axios';

// API Base Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const coinApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
coinApi.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
coinApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

// Types
export interface CoinBalance {
  current: number;
  trend: 'up' | 'down' | 'stable';
  change24h: number;
  lastUpdated: string;
}

export interface CoinTransaction {
  id: string;
  type: 'earned' | 'spent' | 'purchased' | 'transferred';
  amount: number;
  description: string;
  timestamp: string;
  category?: string;
  relatedId?: string;
  metadata?: any;
}

export interface CoinPurchaseRequest {
  agentId: string;
  quantity: number;
  paymentMethod?: 'bank_transfer' | 'mobile_money' | 'cash';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  coinReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
  serialNumber?: number;
  canMintNFT?: boolean;
  mintCost?: number;
}

export interface BattlePass {
  id: string;
  name: string;
  season: number;
  cost: number;
  purchased: boolean;
  currentTier: number;
  maxTier: number;
  xpCurrent: number;
  xpRequired: number;
  freeRewards: any[];
  premiumRewards: any[];
  expiresAt: string;
}

export interface CoinAnalytics {
  totalEarned: number;
  totalSpent: number;
  netFlow: number;
  averageDailyEarnings: number;
  topEarningSource: string;
  topSpendingCategory: string;
  retentionRate: number;
  spendingVelocity: number;
  coinToNairaRatio: number;
  timeframeData: any[];
}

// Coin Balance API
export const coinBalanceApi = {
  // Get current coin balance
  getBalance: async (userId: string): Promise<CoinBalance> => {
    const response = await coinApi.get(`/users/${userId}/coins/balance`);
    return response.data;
  },

  // Update balance (admin only)
  updateBalance: async (userId: string, amount: number, reason: string): Promise<CoinBalance> => {
    const response = await coinApi.post(`/users/${userId}/coins/balance`, { amount, reason });
    return response.data;
  },
};

// Coin Transactions API
export const coinTransactionsApi = {
  // Get transaction history
  getTransactions: async (
    userId: string,
    params: { limit?: number; offset?: number; type?: string; startDate?: string; endDate?: string } = {}
  ): Promise<{ transactions: CoinTransaction[]; total: number }> => {
    const response = await coinApi.get(`/users/${userId}/coins/transactions`, { params });
    return response.data;
  },

  // Create transaction
  createTransaction: async (
    userId: string,
    transaction: Omit<CoinTransaction, 'id' | 'timestamp'>
  ): Promise<CoinTransaction> => {
    const response = await coinApi.post(`/users/${userId}/coins/transactions`, transaction);
    return response.data;
  },

  // Earn coins
  earnCoins: async (
    userId: string,
    amount: number,
    source: string,
    description: string,
    metadata?: any
  ): Promise<{ transaction: CoinTransaction; newBalance: CoinBalance }> => {
    const response = await coinApi.post(`/users/${userId}/coins/earn`, {
      amount,
      source,
      description,
      metadata,
    });
    return response.data;
  },

  // Spend coins
  spendCoins: async (
    userId: string,
    amount: number,
    category: string,
    description: string,
    metadata?: any
  ): Promise<{ transaction: CoinTransaction; newBalance: CoinBalance }> => {
    const response = await coinApi.post(`/users/${userId}/coins/spend`, {
      amount,
      category,
      description,
      metadata,
    });
    return response.data;
  },
};

// Coin Purchase API
export const coinPurchaseApi = {
  // Get available agents
  getAvailableAgents: async (params: { location?: string; limit?: number } = {}): Promise<any[]> => {
    const response = await coinApi.get('/coins/agents/available', { params });
    return response.data;
  },

  // Request coin purchase
  requestPurchase: async (
    userId: string,
    request: CoinPurchaseRequest
  ): Promise<{ purchase: any; escrow: any }> => {
    const response = await coinApi.post(`/users/${userId}/coins/purchase`, request);
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (
    userId: string,
    transactionId: string,
    paymentMethod: string,
    proof?: any
  ): Promise<{ purchase: any; transaction: CoinTransaction }> => {
    const response = await coinApi.post(`/users/${userId}/coins/purchase/${transactionId}/confirm`, {
      paymentMethod,
      proof,
    });
    return response.data;
  },

  // Get pending purchases
  getPendingPurchases: async (userId: string): Promise<any[]> => {
    const response = await coinApi.get(`/users/${userId}/coins/purchase/pending`);
    return response.data;
  },

  // Cancel purchase
  cancelPurchase: async (userId: string, transactionId: string): Promise<void> => {
    await coinApi.post(`/users/${userId}/coins/purchase/${transactionId}/cancel`);
  },
};

// Achievements API
export const achievementsApi = {
  // Get user achievements
  getAchievements: async (userId: string): Promise<Achievement[]> => {
    const response = await coinApi.get(`/users/${userId}/achievements`);
    return response.data;
  },

  // Unlock achievement
  unlockAchievement: async (
    userId: string,
    achievementId: string
  ): Promise<{ achievement: Achievement; reward: CoinTransaction }> => {
    const response = await coinApi.post(`/users/${userId}/achievements/${achievementId}/unlock`);
    return response.data;
  },

  // Update achievement progress
  updateProgress: async (
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<Achievement> => {
    const response = await coinApi.put(`/users/${userId}/achievements/${achievementId}/progress`, {
      progress,
    });
    return response.data;
  },

  // Mint NFT from achievement
  mintNFT: async (
    userId: string,
    achievementId: string
  ): Promise<{ nft: any; transaction: CoinTransaction }> => {
    const response = await coinApi.post(`/users/${userId}/achievements/${achievementId}/mint-nft`);
    return response.data;
  },
};

// Battle Pass API
export const battlePassApi = {
  // Get current battle pass
  getCurrentBattlePass: async (userId: string): Promise<BattlePass> => {
    const response = await coinApi.get(`/users/${userId}/battle-pass/current`);
    return response.data;
  },

  // Purchase battle pass
  purchaseBattlePass: async (userId: string, seasonId: string): Promise<BattlePass> => {
    const response = await coinApi.post(`/users/${userId}/battle-pass/purchase`, { seasonId });
    return response.data;
  },

  // Claim reward
  claimReward: async (
    userId: string,
    tier: number,
    isPremium: boolean = false
  ): Promise<{ reward: any; transaction?: CoinTransaction }> => {
    const response = await coinApi.post(`/users/${userId}/battle-pass/claim`, {
      tier,
      isPremium,
    });
    return response.data;
  },

  // Add XP
  addXP: async (userId: string, xpAmount: number, source: string): Promise<BattlePass> => {
    const response = await coinApi.post(`/users/${userId}/battle-pass/xp`, {
      xpAmount,
      source,
    });
    return response.data;
  },
};

// Analytics API
export const coinAnalyticsApi = {
  // Get coin analytics
  getAnalytics: async (
    userId: string,
    timeframe: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<CoinAnalytics> => {
    const response = await coinApi.get(`/analytics/coins/${userId}`, {
      params: { timeframe },
    });
    return response.data;
  },

  // Track event
  trackEvent: async (
    userId: string,
    eventType: string,
    eventData: any
  ): Promise<void> => {
    await coinApi.post('/analytics/events', {
      userId,
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
    });
  },

  // Get leaderboard
  getLeaderboard: async (
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly',
    limit: number = 50
  ): Promise<any[]> => {
    const response = await coinApi.get('/leaderboard', {
      params: { timeframe, limit },
    });
    return response.data;
  },
};

// Marketplace API
export const marketplaceApi = {
  // Get marketplace items
  getItems: async (params: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'popular' | 'new';
    limit?: number;
  } = {}): Promise<any[]> => {
    const response = await coinApi.get('/marketplace/items', { params });
    return response.data;
  },

  // Purchase item
  purchaseItem: async (
    userId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<{ purchase: any; transaction: CoinTransaction }> => {
    const response = await coinApi.post(`/users/${userId}/marketplace/purchase`, {
      itemId,
      quantity,
    });
    return response.data;
  },

  // Redeem item
  redeemItem: async (
    userId: string,
    purchaseId: string
  ): Promise<{ redemption: any; transaction?: CoinTransaction }> => {
    const response = await coinApi.post(`/users/${userId}/marketplace/redeem/${purchaseId}`);
    return response.data;
  },
};

// WebSocket connection for real-time updates
export class CoinWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: string, onMessage: (data: any) => void): void {
    try {
      const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/coins/ws/${userId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Coin WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Coin WebSocket disconnected');
        this.attemptReconnect(userId, onMessage);
      };

      this.ws.onerror = (error) => {
        console.error('Coin WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to Coin WebSocket:', error);
    }
  }

  private attemptReconnect(userId: string, onMessage: (data: any) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(userId, onMessage);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

// Export singleton WebSocket instance
export const coinWebSocket = new CoinWebSocket();

// Export all APIs as a single object
const coinApiService = {
  balance: coinBalanceApi,
  transactions: coinTransactionsApi,
  purchase: coinPurchaseApi,
  achievements: achievementsApi,
  battlePass: battlePassApi,
  analytics: coinAnalyticsApi,
  marketplace: marketplaceApi,
  webSocket: coinWebSocket,
};

export default coinApiService;