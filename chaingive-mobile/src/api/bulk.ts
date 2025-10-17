import { apiClient } from './client';

export interface BulkTransaction {
  id: string;
  name: string;
  type: 'payment' | 'transfer' | 'payout';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  createdAt: string;
  completedAt?: string;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  sampleFile: string;
}

export const bulkAPI = {
  getBulkTransactionHistory: (accountId: string) =>
    apiClient.get<BulkTransaction[]>(`/bulk/${accountId}/history`),
  getBulkTransactionTemplates: (accountId: string) =>
    apiClient.get<TransactionTemplate[]>(`/bulk/${accountId}/templates`),
  downloadBulkTransactionTemplate: (accountId: string, templateId: string) =>
    apiClient.get(`/bulk/${accountId}/templates/${templateId}/download`),
  uploadBulkTransactionFile: (accountId: string, templateId: string, file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/bulk/${accountId}/templates/${templateId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  retryBulkTransaction: (accountId: string, transactionId: string) =>
    apiClient.post(`/bulk/${accountId}/history/${transactionId}/retry`),
};
