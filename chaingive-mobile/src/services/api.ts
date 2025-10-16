import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.chaingive.com';
const API_TIMEOUT = 30000; // 30 seconds

// Request/Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// HTTP Client Class
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  async setToken(token: string): Promise<void> {
    this.accessToken = token;
    await AsyncStorage.setItem('authToken', token);
  }

  async setRefreshToken(token: string): Promise<void> {
    this.refreshToken = token;
    await AsyncStorage.setItem('refreshToken', token);
  }

  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      if (this.accessToken) {
        return this.accessToken;
      }
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
    } = config;

    try {
      const token = await this.getAuthToken();
      const url = `${this.baseURL}${endpoint}`;

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
      };

      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error(`API Request failed for ${endpoint}:`, error);

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
        };
      }

      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  async put<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  async patch<T>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_OTP: '/auth/verify-otp',
  },

  // User Management
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    BALANCE: '/users/balance',
    TRANSACTIONS: '/users/transactions',
  },

  // Gamification
  GAMIFICATION: {
    ACHIEVEMENTS: '/gamification/achievements',
    MISSIONS: '/gamification/missions',
    STREAK: '/gamification/streak',
    PROGRESS: '/gamification/progress',
  },

  // Battle Pass
  BATTLE_PASS: {
    FETCH: '/gamification/battle-pass',
    PURCHASE: '/gamification/battle-pass/purchase',
    CLAIM: '/gamification/battle-pass/claim',
  },

  // Analytics
  ANALYTICS: {
    USER_STATS: '/analytics/user',
    COIN_FLOW: '/analytics/coin-flow',
    EXPORT_DATA: '/analytics/export',
    COIN_DATA_EXPORT: '/analytics/coin-data/export',
  },

  // Charity Categories
  CHARITY_CATEGORIES: {
    LIST: '/charity-categories',
    CREATE: '/charity-categories',
    UPDATE: '/charity-categories',
    DELETE: '/charity-categories',
    PROGRESS: '/charity-categories/progress',
    CHALLENGES: '/charity-categories/challenges',
    LEADERBOARD: '/charity-categories/leaderboard',
  },

  // Crew System
  CREW: {
    LIST: '/crew',
    CREATE: '/crew',
    JOIN: '/crew/join',
    LEAVE: '/crew/leave',
    MEMBERS: '/crew/members',
    DONATIONS: '/crew/donations',
    CHALLENGES: '/crew/challenges',
    LEADERBOARD: '/crew/leaderboard',
  },

  // Trust System
  TRUST: {
    REVIEWS: '/trust/reviews',
    SUBMIT_REVIEW: '/trust/reviews',
    UPLOAD_VIDEO: '/trust/reviews/video',
    USER_LEVEL: '/trust/level',
    CHALLENGES: '/trust/challenges',
    LEADERBOARD: '/trust/leaderboard',
  },

  // Weekly Targets
  WEEKLY_TARGETS: {
    CURRENT: '/weekly-targets/current',
    GENERATE: '/weekly-targets/generate',
    UPDATE_PROGRESS: '/weekly-targets/progress',
    COMPLETE: '/weekly-targets/complete',
    STATS: '/weekly-targets/stats',
    LEADERBOARD: '/weekly-targets/leaderboard',
    AI_SUGGESTIONS: '/weekly-targets/ai-suggestions',
  },

  // User Levels
  USER_LEVELS: {
    CURRENT: '/user-levels/current',
    PROGRESS: '/user-levels/progress',
    LEADERBOARD: '/user-levels/leaderboard',
    AWARD_XP: '/user-levels/xp',
    UNLOCK_PERK: '/user-levels/perks',
    MILESTONES: '/user-levels/milestones',
  },

  // Charitable NFTs
  NFT: {
    USER_NFTS: '/nft/user',
    COLLECTIONS: '/nft/collections',
    MINT: '/nft/mint',
    MARKETPLACE: '/nft/marketplace',
    LIST_FOR_SALE: '/nft/list',
    PURCHASE: '/nft/purchase',
    WALLET: '/nft/wallet',
    GAS_ESTIMATE: '/nft/gas-estimate',
    HISTORY: '/nft/history',
  },

  // Marketplace
  MARKETPLACE: {
    ITEMS: '/marketplace/items',
    AUCTIONS: '/marketplace/auctions',
    BID: '/marketplace/bid',
    BUY_NOW: '/marketplace/buy-now',
    PURCHASE: '/marketplace/purchase',
  },

  // Coin Purchase
  COIN_PURCHASE: {
    AGENTS: '/coin-purchase/agents',
    REQUEST: '/coin-purchase/request',
    CONFIRM: '/coin-purchase/confirm',
    HISTORY: '/coin-purchase/history',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread',
    MARK_READ: '/notifications/read',
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: '/notifications',
    REGISTER_TOKEN: '/notifications/token',
  },

  // WebSocket
  WEBSOCKET: {
    CONNECT: '/ws',
    CREW_UPDATES: '/ws/crew',
    LEADERBOARD_UPDATES: '/ws/leaderboard',
    MISSION_UPDATES: '/ws/missions',
    CHALLENGE_UPDATES: '/ws/challenges',
  },
} as const;

// Utility functions
export const handleApiError = (error: string): string => {
  // Map common API errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'Network request failed': 'Please check your internet connection',
    'Request timeout': 'Request timed out. Please try again',
    'Unauthorized': 'Please log in to continue',
    'Forbidden': 'You don\'t have permission to perform this action',
    'Not found': 'The requested resource was not found',
    'Internal server error': 'Something went wrong. Please try again later',
  };

  return errorMap[error] || error;
};

export const isNetworkError = (error: string): boolean => {
  return error.includes('Network') || error.includes('timeout') || error.includes('connection');
};

export const shouldRetry = (error: string, attemptCount: number): boolean => {
  return isNetworkError(error) && attemptCount < 3;
};

// Export types
export type { ApiResponse, RequestConfig };
