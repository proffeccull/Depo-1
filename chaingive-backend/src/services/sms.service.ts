import axios from 'axios';
import logger from '../utils/logger';

export interface SMSOptions {
  to: string;
  message: string;
  from?: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  cost?: number;
  error?: string;
}

export class SMSService {
  private readonly apiKey: string;
  private readonly username: string;
  private readonly baseUrl: string = 'https://api.africastalking.com/version1/messaging';

  constructor() {
    this.apiKey = process.env.AFRICAS_TALKING_API_KEY || '';
    this.username = process.env.AFRICAS_TALKING_USERNAME || '';

    if (!this.apiKey || !this.username) {
      logger.warn('Africa\'s Talking credentials not configured - SMS service will use fallback');
    }
  }

  /**
   * Send SMS using Africa's Talking
   */
  async sendSMS(options: SMSOptions): Promise<SMSResponse> {
    try {
      // Validate input
      if (!options.to || !options.message) {
        throw new Error('Phone number and message are required');
      }

      // Format phone number (ensure international format)
      const formattedNumber = this.formatPhoneNumber(options.to);

      // Check if Africa's Talking is configured
      if (!this.apiKey || !this.username) {
        logger.warn('Africa\'s Talking not configured, using fallback logging');
        return this.fallbackSMS(options);
      }

      const response = await axios.post(
        this.baseUrl,
        {
          username: this.username,
          to: formattedNumber,
          message: options.message,
          from: options.from || process.env.SMS_SENDER_ID || 'ChainGive'
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'apiKey': this.apiKey
          }
        }
      );

      const data = response.data;

      if (data.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
        logger.info('SMS sent successfully', {
          to: formattedNumber,
          messageId: data.SMSMessageData.Recipients[0].messageId,
          cost: data.SMSMessageData.Recipients[0].cost
        });

        return {
          success: true,
          messageId: data.SMSMessageData.Recipients[0].messageId,
          cost: parseFloat(data.SMSMessageData.Recipients[0].cost)
        };
      } else {
        throw new Error(data.SMSMessageData?.Recipients?.[0]?.status || 'SMS sending failed');
      }

    } catch (error: any) {
      logger.error('Africa\'s Talking SMS failed', {
        error: error.message,
        to: options.to,
        response: error.response?.data
      });

      // Try fallback SMS service
      return this.fallbackSMS(options);
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(recipients: string[], message: string): Promise<SMSResponse[]> {
    const results: SMSResponse[] = [];

    // Send in batches of 100 to avoid rate limits
    const batchSize = 100;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const batchPromises = batch.map(recipient =>
        this.sendSMS({ to: recipient, message })
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      // Small delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Check SMS delivery status
   */
  async checkDeliveryStatus(messageId: string): Promise<string> {
    try {
      if (!this.apiKey || !this.username) {
        return 'unknown';
      }

      const response = await axios.get(
        `https://api.africastalking.com/version1/messaging?username=${this.username}&messageId=${messageId}`,
        {
          headers: {
            'Accept': 'application/json',
            'apiKey': this.apiKey
          }
        }
      );

      const status = response.data.SMSMessageData?.Recipients?.[0]?.status;
      return status || 'unknown';

    } catch (error: any) {
      logger.error('Failed to check SMS delivery status', {
        error: error.message,
        messageId
      });
      return 'unknown';
    }
  }

  /**
   * Get SMS balance/cost information
   */
  async getBalance(): Promise<{ balance: number; currency: string } | null> {
    try {
      if (!this.apiKey || !this.username) {
        return null;
      }

      const response = await axios.get(
        `https://api.africastalking.com/version1/user?username=${this.username}`,
        {
          headers: {
            'Accept': 'application/json',
            'apiKey': this.apiKey
          }
        }
      );

      const userData = response.data.UserData;
      return {
        balance: parseFloat(userData.balance),
        currency: userData.currency || 'USD'
      };

    } catch (error: any) {
      logger.error('Failed to get SMS balance', { error: error.message });
      return null;
    }
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Handle Nigerian numbers (common in ChainGive)
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      // Convert 08012345678 to +2348012345678
      cleaned = '234' + cleaned.substring(1);
    } else if (cleaned.startsWith('234') && cleaned.length === 13) {
      // Already in correct format
    } else if (!cleaned.startsWith('234') && cleaned.length === 10) {
      // Assume Nigerian number without country code
      cleaned = '234' + cleaned;
    }

    // Add + prefix if not present
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Fallback SMS service (logs to console/file)
   */
  private async fallbackSMS(options: SMSOptions): Promise<SMSResponse> {
    logger.info('SMS Fallback - Message would be sent', {
      to: options.to,
      message: options.message,
      from: options.from
    });

    // In production, you might want to:
    // 1. Queue messages for later sending
    // 2. Use alternative SMS providers (Twilio, etc.)
    // 3. Store in database for manual sending

    return {
      success: true,
      messageId: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
}

// Export singleton instance
export const smsService = new SMSService();

// Export convenience function
export async function sendSMS(to: string, message: string, from?: string): Promise<SMSResponse> {
  return smsService.sendSMS({ to, message, from });
}

// Export KYC approval SMS function
export async function sendKYCApprovalSMS(to: string, userName: string): Promise<SMSResponse> {
  const message = `Hi ${userName}, your KYC verification has been approved! You can now access all ChainGive features.`;
  return smsService.sendSMS({ to, message });
}

// Export OTP SMS function
export async function sendOTPSMS(phoneNumber: string, otp: string): Promise<boolean> {
  const message = `Your ChainGive verification code is: ${otp}. This code expires in 10 minutes.`;
  const result = await smsService.sendSMS({ to: phoneNumber, message });
  return result.success;
}

// Export escrow release SMS function
export async function sendEscrowReleaseSMS(to: string, amount: number, recipientName: string): Promise<SMSResponse> {
  const message = `Your escrow of ₦${amount.toLocaleString()} has been released to ${recipientName}. Thank you for using ChainGive!`;
  return smsService.sendSMS({ to, message });
}

// Export donation confirmation SMS functions
export async function sendDonationConfirmationSMS(to: string, amount: number, donorName: string): Promise<SMSResponse> {
  const message = `You have received ₦${amount.toLocaleString()} from ${donorName} through ChainGive. Funds will be available after escrow release.`;
  return smsService.sendSMS({ to, message });
}

export async function sendReceiptConfirmationSMS(to: string, amount: number, recipientName: string): Promise<SMSResponse> {
  const message = `Your donation of ₦${amount.toLocaleString()} to ${recipientName} has been confirmed. Thank you for your generosity!`;
  return smsService.sendSMS({ to, message });
}
