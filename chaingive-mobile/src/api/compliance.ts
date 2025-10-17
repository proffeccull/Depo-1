import { apiClient } from './client';

export interface ComplianceStatus {
  overallCompliance: number;
  items: {
    id: string;
    name: string;
    progress: number;
    status: 'complete' | 'pending' | 'in-progress' | 'rejected';
  }[];
}

export const complianceAPI = {
  getComplianceStatus: (accountId: string) =>
    apiClient.get<ComplianceStatus>(`/compliance/${accountId}`),
};
