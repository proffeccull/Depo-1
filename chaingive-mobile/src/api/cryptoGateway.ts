import { apiClient } from './client';
import {
  CryptoGateway,
  CryptoPayment,
  CreatePaymentRequest,
  PaymentStatus,
  ExchangeRate,
  CryptoTransaction,
  SupportedCurrency
} from '../types/cryptoGateway';

export class CryptoGatewayApi {
  /**
   * Get all available crypto gateways
   */
  static async getAvailableGateways(): Promise<CryptoGateway[]> {
    const response = await apiClient.get('/crypto/gateways');
    return response.data.data;
  }

  /**
   * Get exchange rates for a specific gateway
   */
  static async getExchangeRates(gatewayName: string): Promise<ExchangeRate[]> {
    const response = await apiClient.get(`/crypto/gateways/${gatewayName}/rates`);
    return response.data.data;
  }

  /**
   * Create a crypto payment
   */
  static async createPayment(request: CreatePaymentRequest): Promise<CryptoPayment> {
    const response = await apiClient.post('/crypto/payments', request);
    return response.data.data;
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const response = await apiClient.get(`/crypto/payments/${paymentId}/status`);
    return response.data.data;
  }

  /**
   * Get user's crypto transaction history
   */
  static async getTransactionHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<CryptoTransaction[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await apiClient.get(`/crypto/transactions?${params}`);
    return response.data.data;
  }

  /**
   * Verify crypto payment
   */
  static async verifyPayment(paymentId: string): Promise<{
    verified: boolean;
    status: string;
    transactionHash?: string;
    confirmations?: number;
  }> {
    const response = await apiClient.post(`/crypto/payments/${paymentId}/verify`);
    return response.data.data;
  }

  /**
   * Get supported currencies for a gateway
   */
  static async getSupportedCurrencies(gatewayName: string): Promise<SupportedCurrency[]> {
    const response = await apiClient.get(`/crypto/gateways/${gatewayName}/currencies`);
    return response.data.data;
  }

  /**
   * Get payment QR code data
   */
  static async getPaymentQR(paymentId: string): Promise<{
    qrCode: string;
    address: string;
    amount: number;
    currency: string;
    expiresAt: string;
  }> {
    const response = await apiClient.get(`/crypto/payments/${paymentId}/qr`);
    return response.data.data;
  }

  /**
   * Cancel a pending crypto payment
   */
  static async cancelPayment(paymentId: string): Promise<void> {
    await apiClient.post(`/crypto/payments/${paymentId}/cancel`);
  }

  /**
   * Get payment methods for coin purchases
   */
  static async getCoinPurchaseMethods(): Promise<{
    gateway: string;
    methods: {
      currency: string;
      network: string;
      minAmount: number;
      maxAmount: number;
      fee: number;
    }[];
  }[]> {
    const response = await apiClient.get('/crypto/coin-purchase/methods');
    return response.data.data;
  }

  /**
   * Create coin purchase payment
   */
  static async createCoinPurchase(
    amount: number,
    currency: string,
    gateway: string,
    coinAmount: number
  ): Promise<CryptoPayment> {
    const response = await apiClient.post('/crypto/coin-purchase', {
      amount,
      currency,
      gateway,
      coinAmount
    });
    return response.data.data;
  }

  /**
   * Get estimated coin amount for fiat payment
   */
  static async getCoinEstimate(
    fiatAmount: number,
    fiatCurrency: string,
    gateway: string
  ): Promise<{
    coinAmount: number;
    exchangeRate: number;
    fee: number;
    total: number;
  }> {
    const params = new URLSearchParams({
      amount: fiatAmount.toString(),
      currency: fiatCurrency,
      gateway
    });

    const response = await apiClient.get(`/crypto/coin-estimate?${params}`);
    return response.data.data;
  }

  /**
   * Get crypto payment statistics
   */
  static async getPaymentStats(period: '7d' | '30d' | '90d' = '30d'): Promise<{
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalVolume: number;
    averagePaymentTime: number;
    popularCurrencies: {
      currency: string;
      count: number;
      volume: number;
    }[];
  }> {
    const response = await apiClient.get(`/crypto/stats?period=${period}`);
    return response.data.data;
  }

  /**
   * Webhook handler for crypto payment confirmations
   * Note: This is typically called by the backend, but included for completeness
   */
  static async handleWebhook(gateway: string, payload: any): Promise<{
    processed: boolean;
    paymentId?: string;
    status?: string;
  }> {
    const response = await apiClient.post(`/crypto/webhooks/${gateway}`, payload);
    return response.data.data;
  }
}