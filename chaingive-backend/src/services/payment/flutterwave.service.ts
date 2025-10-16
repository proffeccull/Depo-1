import axios from 'axios';
import logger from '../utils/logger';

const BASE_URL = 'https://api.flutterwave.com/v3';

export interface FlutterwaveConfig {
  secretKey: string;
  publicKey: string;
  encryptionKey: string;
}

export class FlutterwaveService {
  private config: FlutterwaveConfig;

  constructor(config: FlutterwaveConfig) {
    this.config = config;
  }

  /**
   * Initialize payment for deposits
   */
  async initiatePayment(data: {
    amount: number;
    email: string;
    phone: string;
    txRef: string;
    redirectUrl?: string;
    meta?: any;
  }) {
    try {
      const response = await axios.post(
        `${BASE_URL}/payments`,
        {
          tx_ref: data.txRef,
          amount: data.amount,
          currency: 'NGN',
          redirect_url: data.redirectUrl || process.env.FLUTTERWAVE_REDIRECT_URL,
          customer: {
            email: data.email,
            phonenumber: data.phone,
          },
          payment_options: 'card,banktransfer,ussd',
          meta: data.meta,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info(`Flutterwave payment initiated: ${data.txRef}`);
      return response.data;
    } catch (error: any) {
      logger.error('Flutterwave payment initiation failed:', error.response?.data || error.message);
      throw new Error('Failed to initiate payment');
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(txRef: string) {
    try {
      const response = await axios.get(
        `${BASE_URL}/transactions/verify_by_reference?tx_ref=${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.secretKey}`,
          },
        }
      );

      logger.info(`Flutterwave payment verified: ${txRef}`);
      return response.data;
    } catch (error: any) {
      logger.error('Flutterwave payment verification failed:', error.response?.data || error.message);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Handle webhook from Flutterwave
   */
  verifyWebhookSignature(signature: string, payload: any): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha256', this.config.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }
}
