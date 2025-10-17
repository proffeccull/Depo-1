import { apiClient } from './client';

export const coinPurchaseAPI = {
  // Get available agents for coin purchase
  getAvailableAgents: () => {
    return apiClient.get('/coins/purchase/agents/available');
  },

  // Request coin purchase (creates escrow)
  requestPurchase: (data: {
    agentId: string;
    quantity: number;
  }) => {
    return apiClient.post('/coins/purchase/request', data);
  },

  // Confirm payment sent
  confirmPayment: (data: {
    transactionId: string;
    paymentMethod: 'bank_transfer' | 'mobile_money' | 'cash';
    paymentProof?: string;
  }) => {
    return apiClient.post(`/coins/purchase/${data.transactionId}/confirm-payment`, {
      paymentMethod: data.paymentMethod,
      paymentProof: data.paymentProof,
    });
  },

  // Get user's purchase history
  getPurchaseHistory: (params?: { search?: string; status?: string }) => {
    return apiClient.get('/coins/purchase/my-purchases', { params });
  },

  // Get pending purchases (waiting for agent confirmation)
  getPendingPurchases: () => {
    return apiClient.get('/coins/purchase/pending');
  },
};
