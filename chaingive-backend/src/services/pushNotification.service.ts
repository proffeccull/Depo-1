import axios from 'axios';
import logger from '../utils/logger';

export interface PushNotificationPayload {
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  ttl?: number; // Time to live in seconds
}

export interface PushNotificationOptions {
  userId?: string;
  deviceTokens?: string[];
  segments?: string[];
  filters?: Record<string, any>;
}

export interface PushResponse {
  success: boolean;
  recipients?: number;
  messageId?: string;
  error?: string;
}

export class PushNotificationService {
  private readonly appId: string;
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://onesignal.com/api/v1';

  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID || '';
    this.apiKey = process.env.ONESIGNAL_API_KEY || '';

    if (!this.appId || !this.apiKey) {
      logger.warn('OneSignal credentials not configured - push notifications will use fallback');
    }
  }

  /**
   * Send push notification to specific users
   */
  async sendToUsers(
    payload: PushNotificationPayload,
    options: PushNotificationOptions
  ): Promise<PushResponse> {
    try {
      if (!this.appId || !this.apiKey) {
        logger.warn('OneSignal not configured, using fallback');
        return this.fallbackNotification(payload, options);
      }

      const notificationData = {
        app_id: this.appId,
        headings: { en: payload.title },
        contents: { en: payload.message },
        data: payload.data || {},
        priority: this.mapPriority(payload.priority || 'normal'),
        ttl: payload.ttl || 86400, // 24 hours default
        ...this.buildTargetOptions(options)
      };

      const response = await axios.post(
        `${this.baseUrl}/notifications`,
        notificationData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.apiKey}`
          }
        }
      );

      logger.info('Push notification sent', {
        messageId: response.data.id,
        recipients: response.data.recipients
      });

      return {
        success: true,
        recipients: response.data.recipients,
        messageId: response.data.id
      };

    } catch (error: any) {
      logger.error('OneSignal push notification failed', {
        error: error.message,
        response: error.response?.data
      });

      return this.fallbackNotification(payload, options);
    }
  }

  /**
   * Send notification to all users
   */
  async sendToAll(payload: PushNotificationPayload): Promise<PushResponse> {
    return this.sendToUsers(payload, { segments: ['All'] });
  }

  /**
   * Send notification to specific segments
   */
  async sendToSegment(
    segment: string,
    payload: PushNotificationPayload
  ): Promise<PushResponse> {
    return this.sendToUsers(payload, { segments: [segment] });
  }

  /**
   * Send notification to specific user by ID
   */
  async sendToUser(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<PushResponse> {
    return this.sendToUsers(payload, { userId });
  }

  /**
   * Send notification to specific device tokens
   */
  async sendToDeviceTokens(
    deviceTokens: string[],
    payload: PushNotificationPayload
  ): Promise<PushResponse> {
    return this.sendToUsers(payload, { deviceTokens });
  }

  /**
   * Create or update user segments
   */
  async createSegment(name: string, filters: Record<string, any>): Promise<boolean> {
    try {
      if (!this.appId || !this.apiKey) {
        return false;
      }

      await axios.post(
        `${this.baseUrl}/apps/${this.appId}/segments`,
        {
          name,
          filters: this.buildFilters(filters)
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.apiKey}`
          }
        }
      );

      logger.info('Segment created', { name });
      return true;

    } catch (error: any) {
      logger.error('Failed to create segment', {
        error: error.message,
        segment: name
      });
      return false;
    }
  }

  /**
   * Get notification delivery statistics
   */
  async getNotificationStats(messageId: string): Promise<any> {
    try {
      if (!this.appId || !this.apiKey) {
        return null;
      }

      const response = await axios.get(
        `${this.baseUrl}/notifications/${messageId}`,
        {
          params: { app_id: this.appId },
          headers: {
            'Authorization': `Basic ${this.apiKey}`
          }
        }
      );

      return {
        sent: response.data.successful,
        failed: response.data.failed,
        remaining: response.data.remaining,
        converted: response.data.converted
      };

    } catch (error: any) {
      logger.error('Failed to get notification stats', {
        error: error.message,
        messageId
      });
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(messageId: string): Promise<boolean> {
    try {
      if (!this.appId || !this.apiKey) {
        return false;
      }

      await axios.delete(
        `${this.baseUrl}/notifications/${messageId}`,
        {
          params: { app_id: this.appId },
          headers: {
            'Authorization': `Basic ${this.apiKey}`
          }
        }
      );

      logger.info('Notification cancelled', { messageId });
      return true;

    } catch (error: any) {
      logger.error('Failed to cancel notification', {
        error: error.message,
        messageId
      });
      return false;
    }
  }

  /**
   * Build targeting options for OneSignal API
   */
  private buildTargetOptions(options: PushNotificationOptions): Record<string, any> {
    const targeting: Record<string, any> = {};

    if (options.userId) {
      targeting.external_user_id = options.userId;
    }

    if (options.deviceTokens && options.deviceTokens.length > 0) {
      targeting.include_player_ids = options.deviceTokens;
    }

    if (options.segments && options.segments.length > 0) {
      targeting.included_segments = options.segments;
    }

    if (options.filters) {
      targeting.filters = this.buildFilters(options.filters);
    }

    return targeting;
  }

  /**
   * Build filters for OneSignal API
   */
  private buildFilters(filters: Record<string, any>): any[] {
    const oneSignalFilters: any[] = [];

    Object.entries(filters).forEach(([key, value]) => {
      oneSignalFilters.push({
        field: 'tag',
        key,
        relation: '=',
        value
      });
    });

    return oneSignalFilters;
  }

  /**
   * Map priority levels
   */
  private mapPriority(priority: 'low' | 'normal' | 'high'): number {
    switch (priority) {
      case 'low': return 5;
      case 'high': return 10;
      default: return 7; // normal
    }
  }

  /**
   * Fallback notification service
   */
  private async fallbackNotification(
    payload: PushNotificationPayload,
    options: PushNotificationOptions
  ): Promise<PushResponse> {
    logger.info('Push Notification Fallback - Message would be sent', {
      title: payload.title,
      message: payload.message,
      data: payload.data,
      options
    });

    // In production, you might want to:
    // 1. Queue notifications for later sending
    // 2. Use alternative push providers (Firebase, etc.)
    // 3. Store in database for manual sending

    return {
      success: true,
      recipients: options.deviceTokens?.length || 1,
      messageId: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Export convenience functions
export async function sendPushToUser(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<PushResponse> {
  return pushNotificationService.sendToUser(userId, { title, message, data });
}

export async function sendPushToAll(
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<PushResponse> {
  return pushNotificationService.sendToAll({ title, message, data });
}

export async function sendPushToSegment(
  segment: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<PushResponse> {
  return pushNotificationService.sendToSegment(segment, { title, message, data });
}