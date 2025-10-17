import { apiClient } from './client';

export const donationsAPI = {
  getCycles: (params?: { status?: string; page?: number; limit?: number; search?: string }) =>
    apiClient.get('/cycles', { params }),
  getCycle: (cycleId: string) => apiClient.get(`/cycles/${cycleId}`),
  give: (payload: {
    amount: number;
    recipientPreference: 'algorithm' | 'manual';
    recipientId?: string;
    location?: string;
    faith?: string;
  }) => apiClient.post('/donations/give', payload),
  confirmReceipt: (payload: { transactionId: string; confirm: boolean }) =>
    apiClient.post('/cycles/confirm-receipt', payload),
  getParties: (cycleId: string) => apiClient.get(`/cycles/${cycleId}/parties`),
};
