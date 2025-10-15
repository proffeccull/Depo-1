import { apiClient } from './client';
import {
  MerchantAccount,
  CreateMerchantRequest,
  UpdateMerchantRequest,
  MerchantPayment,
  ProcessPaymentRequest,
  MerchantAnalytics,
  MerchantSearchFilters
} from '../types/merchant';

export class MerchantApi {
  /**
   * Create a new merchant account
   */
  static async createMerchant(data: CreateMerchantRequest): Promise<MerchantAccount> {
    const response = await apiClient.post('/merchants', data);
    return response.data.data;
  }

  /**
   * Get merchant account details
   */
  static async getMerchant(merchantId: string): Promise<MerchantAccount> {
    const response = await apiClient.get(`/merchants/${merchantId}`);
    return response.data.data;
  }

  /**
   * Update merchant account
   */
  static async updateMerchant(merchantId: string, data: UpdateMerchantRequest): Promise<MerchantAccount> {
    const response = await apiClient.put(`/merchants/${merchantId}`, data);
    return response.data.data;
  }

  /**
   * Delete merchant account
   */
  static async deleteMerchant(merchantId: string): Promise<void> {
    await apiClient.delete(`/merchants/${merchantId}`);
  }

  /**
   * Get merchants by location
   */
  static async getMerchantsByLocation(lat: number, lng: number, radius?: number): Promise<MerchantAccount[]> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      ...(radius && { radius: radius.toString() })
    });

    const response = await apiClient.get(`/merchants/location?${params}`);
    return response.data.data;
  }

  /**
   * Search merchants
   */
  static async searchMerchants(filters: MerchantSearchFilters): Promise<MerchantAccount[]> {
    const params = new URLSearchParams();

    if (filters.query) params.append('query', filters.query);
    if (filters.category) params.append('category', filters.category);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await apiClient.get(`/merchants/search?${params}`);
    return response.data.data;
  }

  /**
   * Generate QR code for merchant
   */
  static async generateMerchantQR(merchantId: string): Promise<{ qrCode: string }> {
    const response = await apiClient.get(`/merchants/${merchantId}/qr`);
    return response.data.data;
  }

  /**
   * Process payment to merchant
   */
  static async processPayment(merchantId: string, data: ProcessPaymentRequest): Promise<MerchantPayment> {
    const response = await apiClient.post(`/merchants/${merchantId}/pay`, data);
    return response.data.data;
  }

  /**
   * Get merchant payment history
   */
  static async getMerchantPayments(
    merchantId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<MerchantPayment[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await apiClient.get(`/merchants/${merchantId}/payments?${params}`);
    return response.data.data;
  }

  /**
   * Update merchant verification status (Admin only)
   */
  static async updateMerchantVerification(
    merchantId: string,
    isVerified: boolean,
    rejectionReason?: string
  ): Promise<MerchantAccount> {
    const response = await apiClient.patch(`/merchants/${merchantId}/verification`, {
      isVerified,
      rejectionReason
    });
    return response.data.data;
  }

  /**
   * Get merchant analytics
   */
  static async getMerchantAnalytics(
    merchantId: string,
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<MerchantAnalytics> {
    const response = await apiClient.get(`/merchants/${merchantId}/analytics?period=${period}`);
    return response.data.data;
  }
}