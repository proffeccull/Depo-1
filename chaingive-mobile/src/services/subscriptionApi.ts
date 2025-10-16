import axiosImport from 'axios';

// API Base Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const axios = (axiosImport as any)?.default ?? (axiosImport as any);
const subscriptionApi = (axios as any).create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
subscriptionApi.interceptors.request.use(
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
subscriptionApi.interceptors.response.use(
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
export interface SubscriptionPlan {
  id: string;
  name: 'Plus' | 'Pro';
  price: number; // coins per month
  features: string[];
  isPopular?: boolean;
  savings?: string;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  renewalDate: string;
  coinMultiplier: number;
  features: string[];
  paymentHistory: SubscriptionPayment[];
}

export interface SubscriptionPayment {
  id: string;
  amount: number; // coins
  date: string;
  status: 'completed' | 'failed' | 'pending';
  planName: string;
}

export interface SubscriptionAnalytics {
  totalRevenue: number;
  activeSubscribers: number;
  churnRate: number;
  averageRevenuePerUser: number;
  planDistribution: Record<string, number>;
  renewalRate: number;
  lifetimeValue: number;
}

// Subscription API
export const subscriptionApiService = {
  // Get available subscription plans
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await subscriptionApi.get('/subscriptions/plans');
    return response.data;
  },

  // Get user's subscription
  getUserSubscription: async (userId: string): Promise<UserSubscription | null> => {
    const response = await subscriptionApi.get(`/users/${userId}/subscription`);
    return response.data;
  },

  // Purchase subscription
  purchaseSubscription: async (
    userId: string,
    planId: string
  ): Promise<{ subscription: UserSubscription; payment: SubscriptionPayment }> => {
    const response = await subscriptionApi.post(`/users/${userId}/subscription/purchase`, {
      planId,
    });
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (userId: string): Promise<UserSubscription> => {
    const response = await subscriptionApi.post(`/users/${userId}/subscription/cancel`);
    return response.data;
  },

  // Toggle auto-renewal
  toggleAutoRenew: async (
    userId: string,
    enabled: boolean
  ): Promise<UserSubscription> => {
    const response = await subscriptionApi.put(`/users/${userId}/subscription/auto-renew`, {
      enabled,
    });
    return response.data;
  },

  // Get subscription payment history
  getPaymentHistory: async (userId: string): Promise<SubscriptionPayment[]> => {
    const response = await subscriptionApi.get(`/users/${userId}/subscription/payments`);
    return response.data;
  },

  // Renew subscription manually
  renewSubscription: async (userId: string): Promise<UserSubscription> => {
    const response = await subscriptionApi.post(`/users/${userId}/subscription/renew`);
    return response.data;
  },

  // Get subscription analytics (admin only)
  getAnalytics: async (
    timeframe: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<SubscriptionAnalytics> => {
    const response = await subscriptionApi.get(`/admin/subscriptions/analytics?timeframe=${timeframe}`);
    return response.data;
  },

  // Validate subscription status
  validateSubscription: async (userId: string): Promise<boolean> => {
    const response = await subscriptionApi.get(`/users/${userId}/subscription/validate`);
    return response.data.valid;
  },

  // Get subscription features for user
  getUserFeatures: async (userId: string): Promise<string[]> => {
    const response = await subscriptionApi.get(`/users/${userId}/subscription/features`);
    return response.data.features;
  },

  // Check if user has specific feature
  hasFeature: async (userId: string, feature: string): Promise<boolean> => {
    const response = await subscriptionApi.get(`/users/${userId}/subscription/has-feature`, {
      params: { feature },
    });
    return response.data.hasFeature;
  },
};

// Subscription WebSocket for real-time updates
export class SubscriptionWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: string, onMessage: (data: any) => void): void {
    try {
      const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/subscriptions/ws/${userId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Subscription WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Failed to parse subscription WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Subscription WebSocket disconnected');
        this.attemptReconnect(userId, onMessage);
      };

      this.ws.onerror = (error) => {
        console.error('Subscription WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to Subscription WebSocket:', error);
    }
  }

  private attemptReconnect(userId: string, onMessage: (data: any) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect subscription WS... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
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
export const subscriptionWebSocket = new SubscriptionWebSocket();

// Export all APIs as a single object
const subscriptionApiService = {
  plans: subscriptionApiService.getPlans,
  user: {
    getSubscription: subscriptionApiService.getUserSubscription,
    purchase: subscriptionApiService.purchaseSubscription,
    cancel: subscriptionApiService.cancelSubscription,
    toggleAutoRenew: subscriptionApiService.toggleAutoRenew,
    getPaymentHistory: subscriptionApiService.getPaymentHistory,
    renew: subscriptionApiService.renewSubscription,
    validate: subscriptionApiService.validateSubscription,
    getFeatures: subscriptionApiService.getUserFeatures,
    hasFeature: subscriptionApiService.hasFeature,
  },
  analytics: subscriptionApiService.getAnalytics,
  webSocket: subscriptionWebSocket,
};

export default subscriptionApiService;