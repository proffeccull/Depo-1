import { apiClient } from './client';
import {
  CorporateAccount,
  CreateCorporateRequest,
  UpdateCorporateRequest,
  CorporateTeamMember,
  CorporateDonation,
  CorporateAnalytics,
  BulkUserCreationRequest,
  BulkDonationRequest,
  CSRTracking
} from '../types/corporate';

export class CorporateApi {
  /**
   * Create a new corporate account
   */
  static async createCorporateAccount(data: CreateCorporateRequest): Promise<CorporateAccount> {
    const response = await apiClient.post('/corporate', data);
    return response.data.data;
  }

  /**
   * Get corporate account details
   */
  static async getCorporateAccount(corporateId: string): Promise<CorporateAccount> {
    const response = await apiClient.get(`/corporate/${corporateId}`);
    return response.data.data;
  }

  /**
   * Update corporate account
   */
  static async updateCorporateAccount(corporateId: string, data: UpdateCorporateRequest): Promise<CorporateAccount> {
    const response = await apiClient.put(`/corporate/${corporateId}`, data);
    return response.data.data;
  }

  /**
   * Delete corporate account
   */
  static async deleteCorporateAccount(corporateId: string): Promise<void> {
    await apiClient.delete(`/corporate/${corporateId}`);
  }

  /**
   * Bulk create users
   */
  static async bulkCreateUsers(corporateId: string, data: BulkUserCreationRequest): Promise<{
    created: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.post(`/corporate/${corporateId}/bulk-users`, data);
    return response.data.data;
  }

  /**
   * Bulk initiate donations
   */
  static async bulkInitiateDonations(corporateId: string, data: BulkDonationRequest): Promise<{
    initiated: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.post(`/corporate/${corporateId}/bulk-donations`, data);
    return response.data.data;
  }

  /**
   * Get corporate analytics
   */
  static async getCorporateAnalytics(
    corporateId: string,
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<CorporateAnalytics> {
    const response = await apiClient.get(`/corporate/${corporateId}/analytics?period=${period}`);
    return response.data.data;
  }

  /**
   * Get corporate team members
   */
  static async getCorporateTeam(
    corporateId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<CorporateTeamMember[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await apiClient.get(`/corporate/${corporateId}/team?${params}`);
    return response.data.data;
  }

  /**
   * Update corporate CSR budget
   */
  static async updateCorporateBudget(corporateId: string, budget: number): Promise<CorporateAccount> {
    const response = await apiClient.patch(`/corporate/${corporateId}/budget`, { budget });
    return response.data.data;
  }

  /**
   * Get corporate donation history
   */
  static async getCorporateDonations(
    corporateId: string,
    limit: number = 20,
    offset: number = 0,
    status?: 'pending' | 'in_transit' | 'received' | 'obligated' | 'fulfilled' | 'defaulted'
  ): Promise<CorporateDonation[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    if (status) {
      params.append('status', status);
    }

    const response = await apiClient.get(`/corporate/${corporateId}/donations?${params}`);
    return response.data.data;
  }

  /**
   * Update corporate verification status (Admin only)
   */
  static async updateCorporateVerification(
    corporateId: string,
    isVerified: boolean,
    rejectionReason?: string
  ): Promise<CorporateAccount> {
    const response = await apiClient.patch(`/corporate/${corporateId}/verification`, {
      isVerified,
      rejectionReason
    });
    return response.data.data;
  }

  /**
   * Get corporate CSR tracking
   */
  static async getCorporateCSRTracking(
    corporateId: string,
    period: '30d' | '90d' | '1y' | 'all' = '1y'
  ): Promise<CSRTracking> {
    const response = await apiClient.get(`/corporate/${corporateId}/csr-tracking?period=${period}`);
    return response.data.data;
  }
}