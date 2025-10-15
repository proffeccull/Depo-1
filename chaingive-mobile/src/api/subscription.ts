import { apiClient } from './client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceCoins: number;
  features: Record<string, any>;
  coinMultiplier: number;
  isActive: boolean;
  sortOrder: number;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan?: SubscriptionPlan;
  subscription?: any;
  daysRemaining?: number;
}

export interface SubscribeRequest {
  planId: string;
  autoRenew?: boolean;
}

export interface CancelSubscriptionRequest {
  reason?: string;
}

export interface UpdateAutoRenewRequest {
  autoRenew: boolean;
}

class SubscriptionAPI {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get('/subscriptions/plans');
    return response.data.data;
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await apiClient.get('/subscriptions/status');
    return response.data.data;
  }

  async subscribe(data: SubscribeRequest) {
    const response = await apiClient.post('/subscriptions/subscribe', data);
    return response.data.data;
  }

  async cancelSubscription(data?: CancelSubscriptionRequest) {
    const response = await apiClient.post('/subscriptions/cancel', data);
    return response.data.data;
  }

  async updateAutoRenew(data: UpdateAutoRenewRequest) {
    const response = await apiClient.patch('/subscriptions/auto-renew', data);
    return response.data.data;
  }

  async getSubscriptionHistory() {
    const response = await apiClient.get('/subscriptions/history');
    return response.data.data;
  }

  async renewSubscription() {
    const response = await apiClient.post('/subscriptions/renew');
    return response.data.data;
  }
}

export const subscriptionAPI = new SubscriptionAPI();