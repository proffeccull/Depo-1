import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { smsService, sendSMS } from './sms.service';
import { pushNotificationService, sendPushToUser, sendPushToAll } from './pushNotification.service';

export interface NotificationPayload {
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'donation' | 'match' | 'reminder' | 'achievement';
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export interface NotificationOptions {
  userId?: string;
  phoneNumber?: string;
  fcmToken?: string;
  email?: string;
  channels?: ('sms' | 'push' | 'email')[];
  scheduleFor?: Date;
}

export interface NotificationResult {
  success: boolean;
  channels: {
    sms?: boolean;
    push?: boolean;
    email?: boolean;
  };
  errors?: string[];
}

export class NotificationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Send notification to user via multiple channels
   */
  async sendNotification(
    userId: string,
    payload: NotificationPayload,
    options: NotificationOptions = {}
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      channels: {}
    };

    try {
      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          phoneNumber: true,
          email: true,
          fcmToken: true,
          preferredLanguage: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        result.errors = ['User not found or inactive'];
        return result;
      }

      // Determine channels to use
      const channels = options.channels || ['push', 'sms'];

      // Send via each channel
      const channelPromises = channels.map(async (channel) => {
        try {
          switch (channel) {
            case 'sms':
              if (user.phoneNumber) {
                const smsResult = await this.sendSMS(user.phoneNumber, payload);
                result.channels.sms = smsResult.success;
              }
              break;

            case 'push':
              if (user.fcmToken) {
                const pushResult = await this.sendPush(userId, payload);
                result.channels.push = pushResult.success;
              }
              break;

            case 'email':
              if (user.email) {
                const emailResult = await this.sendEmail(user.email, payload);
                result.channels.email = emailResult.success;
              }
              break;
          }
        } catch (error: any) {
          logger.error(`Failed to send ${channel} notification`, {
            error: error.message,
            userId,
            channel
          });
        }
      });

      await Promise.allSettled(channelPromises);

      // Store notification record
      await this.storeNotification(userId, payload, result);

      result.success = Object.values(result.channels).some(success => success);
      return result;

    } catch (error: any) {
      logger.error('Notification sending failed', {
        error: error.message,
        userId,
        payload
      });

      result.errors = [error.message];
      return result;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(phoneNumber: string, payload: NotificationPayload): Promise<{ success: boolean }> {
    try {
      const message = this.formatMessage(payload, 'sms');
      const result = await sendSMS(phoneNumber, message);
      return { success: result.success };
    } catch (error) {
      logger.error('SMS notification failed', { error, phoneNumber });
      return { success: false };
    }
  }

  /**
   * Send push notification
   */
  private async sendPush(userId: string, payload: NotificationPayload): Promise<{ success: boolean }> {
    try {
      const title = payload.title || this.getDefaultTitle(payload.type);
      const message = this.formatMessage(payload, 'push');
      const result = await sendPushToUser(userId, title, message, payload.data);
      return { success: result.success };
    } catch (error) {
      logger.error('Push notification failed', { error, userId });
      return { success: false };
    }
  }

  /**
   * Send email notification (placeholder for future implementation)
   */
  private async sendEmail(email: string, payload: NotificationPayload): Promise<{ success: boolean }> {
    // TODO: Implement email service integration
    logger.info('Email notification (placeholder)', { email, payload });
    return { success: true }; // Placeholder
  }

  /**
   * Send broadcast notification to all users
   */
  async sendBroadcast(
    payload: NotificationPayload,
    targetUsers?: string[]
  ): Promise<{ totalSent: number; totalFailed: number }> {
    try {
      let users: { id: string }[];

      if (targetUsers) {
        users = targetUsers.map(id => ({ id }));
      } else {
        users = await this.prisma.user.findMany({
          where: { isActive: true },
          select: { id: true },
          take: 1000 // Limit for performance
        });
      }

      let totalSent = 0;
      let totalFailed = 0;

      // Send in batches to avoid overwhelming services
      const batchSize = 50;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        const batchPromises = batch.map(user =>
          this.sendNotification(user.id, payload, { channels: ['push'] })
        );

        const results = await Promise.allSettled(batchPromises);

        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.success) {
            totalSent++;
          } else {
            totalFailed++;
          }
        });

        // Small delay between batches
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logger.info('Broadcast notification completed', { totalSent, totalFailed });
      return { totalSent, totalFailed };

    } catch (error: any) {
      logger.error('Broadcast notification failed', { error: error.message });
      return { totalSent: 0, totalFailed: 1 };
    }
  }

  /**
   * Send donation-related notifications
   */
  async sendDonationNotification(
    donorId: string,
    recipientId: string,
    amount: number,
    currency: string = 'NGN'
  ): Promise<void> {
    // Notify donor
    await this.sendNotification(donorId, {
      title: 'Donation Sent',
      message: `Your donation of ${currency} ${amount.toLocaleString()} has been sent successfully.`,
      type: 'donation',
      data: { amount, currency, type: 'sent' }
    });

    // Notify recipient
    await this.sendNotification(recipientId, {
      title: 'Donation Received',
      message: `You received a donation of ${currency} ${amount.toLocaleString()}!`,
      type: 'donation',
      data: { amount, currency, type: 'received' }
    });
  }

  /**
   * Send match notification
   */
  async sendMatchNotification(
    donorId: string,
    recipientId: string,
    amount: number,
    deadline: Date
  ): Promise<void> {
    // Notify donor of match
    await this.sendNotification(donorId, {
      title: 'Donation Match Found',
      message: `You have been matched to donate ${amount.toLocaleString()} NGN. Please complete payment within 24 hours.`,
      type: 'match',
      priority: 'high',
      data: { amount, deadline: deadline.toISOString(), type: 'donor' }
    });

    // Notify recipient of match
    await this.sendNotification(recipientId, {
      title: 'Donation Incoming',
      message: `A donor has been matched for your ${amount.toLocaleString()} NGN request.`,
      type: 'match',
      priority: 'high',
      data: { amount, deadline: deadline.toISOString(), type: 'recipient' }
    });
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(
    userId: string,
    amount: number,
    hoursLeft: number
  ): Promise<void> {
    await this.sendNotification(userId, {
      title: 'Payment Reminder',
      message: `You have ${hoursLeft} hours left to complete your ${amount.toLocaleString()} NGN donation.`,
      type: 'reminder',
      priority: hoursLeft <= 2 ? 'high' : 'normal',
      data: { amount, hoursLeft, type: 'payment_reminder' }
    });
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(
    userId: string,
    achievementName: string,
    coinsEarned?: number
  ): Promise<void> {
    const message = coinsEarned
      ? `Congratulations! You earned ${achievementName} and ${coinsEarned} coins!`
      : `Congratulations! You unlocked the ${achievementName} achievement!`;

    await this.sendNotification(userId, {
      title: 'Achievement Unlocked!',
      message,
      type: 'achievement',
      data: { achievementName, coinsEarned, type: 'achievement' }
    });
  }

  /**
   * Format message based on channel and user preferences
   */
  private formatMessage(payload: NotificationPayload, channel: 'sms' | 'push' | 'email'): string {
    let message = payload.message;

    // Channel-specific formatting
    switch (channel) {
      case 'sms':
        // Keep SMS messages concise
        if (message.length > 160) {
          message = message.substring(0, 157) + '...';
        }
        break;

      case 'push':
        // Push notifications can be longer but should be engaging
        if (message.length > 200) {
          message = message.substring(0, 197) + '...';
        }
        break;

      case 'email':
        // Email can be full length
        break;
    }

    return message;
  }

  /**
   * Get default title for notification type
   */
  private getDefaultTitle(type: NotificationPayload['type']): string {
    switch (type) {
      case 'donation': return 'Donation Update';
      case 'match': return 'Match Found';
      case 'reminder': return 'Reminder';
      case 'achievement': return 'Achievement!';
      case 'success': return 'Success!';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      default: return 'ChainGive';
    }
  }

  /**
   * Store notification record in database
   */
  private async storeNotification(
    userId: string,
    payload: NotificationPayload,
    result: NotificationResult
  ): Promise<void> {
    try {
      // For now, just log since we don't have a notifications table yet
      logger.info('Notification stored', {
        userId,
        type: payload.type,
        channels: result.channels,
        success: result.success
      });
    } catch (error) {
      logger.error('Failed to store notification', { error, userId });
    }
  }

  /**
   * Get user's notification preferences
   */
  async getUserPreferences(userId: string): Promise<Record<string, boolean>> {
    // TODO: Implement user notification preferences
    return {
      sms: true,
      push: true,
      email: false
    };
  }

  /**
   * Update user's notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Record<string, boolean>
  ): Promise<void> {
    // TODO: Store preferences in database
    logger.info('User notification preferences updated', { userId, preferences });
  }
}

// Export singleton instance
export const notificationService = new NotificationService(new PrismaClient());

// Export convenience functions
export async function sendUserNotification(
  userId: string,
  message: string,
  type: NotificationPayload['type'] = 'info',
  title?: string
): Promise<NotificationResult> {
  return notificationService.sendNotification(userId, { title, message, type });
}

export async function sendBroadcastNotification(
  message: string,
  title?: string,
  type: NotificationPayload['type'] = 'info'
): Promise<{ totalSent: number; totalFailed: number }> {
  return notificationService.sendBroadcast({ title, message, type });
}
