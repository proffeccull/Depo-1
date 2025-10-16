import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AlertConfig {
  id: string;
  type: 'system_health' | 'performance' | 'security' | 'business';
  condition: 'cpu_high' | 'memory_high' | 'disk_high' | 'error_rate_high' | 'response_time_high' | 'failed_login' | 'large_transaction';
  threshold: number;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

class NotificationService {
  private alerts: AlertConfig[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;

    // Configure push notifications
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
        this.storeToken(token.token);
      },
      onNotification: (notification) => {
        console.log('Notification received:', notification);
        // Handle notification tap
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'system-alerts',
          channelName: 'System Alerts',
          channelDescription: 'Critical system health alerts',
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`System alerts channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'performance-alerts',
          channelName: 'Performance Alerts',
          channelDescription: 'Performance monitoring alerts',
          soundName: 'default',
          importance: 3,
          vibrate: true,
        },
        (created) => console.log(`Performance alerts channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'security-alerts',
          channelName: 'Security Alerts',
          channelDescription: 'Security-related alerts',
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Security alerts channel created: ${created}`)
      );
    }

    // Load saved alerts configuration
    await this.loadAlertsConfig();

    this.isInitialized = true;
  }

  private async storeToken(token: string) {
    try {
      await AsyncStorage.setItem('push_token', token);
    } catch (error) {
      console.error('Failed to store push token:', error);
    }
  }

  private async loadAlertsConfig() {
    try {
      const saved = await AsyncStorage.getItem('alerts_config');
      if (saved) {
        this.alerts = JSON.parse(saved);
      } else {
        // Set default alerts
        this.alerts = this.getDefaultAlerts();
        await this.saveAlertsConfig();
      }
    } catch (error) {
      console.error('Failed to load alerts config:', error);
      this.alerts = this.getDefaultAlerts();
    }
  }

  private async saveAlertsConfig() {
    try {
      await AsyncStorage.setItem('alerts_config', JSON.stringify(this.alerts));
    } catch (error) {
      console.error('Failed to save alerts config:', error);
    }
  }

  private getDefaultAlerts(): AlertConfig[] {
    return [
      {
        id: 'cpu_high',
        type: 'system_health',
        condition: 'cpu_high',
        threshold: 85,
        enabled: true,
        severity: 'high',
        message: 'CPU usage is above 85%',
      },
      {
        id: 'memory_high',
        type: 'system_health',
        condition: 'memory_high',
        threshold: 90,
        enabled: true,
        severity: 'high',
        message: 'Memory usage is above 90%',
      },
      {
        id: 'disk_high',
        type: 'system_health',
        condition: 'disk_high',
        threshold: 95,
        enabled: true,
        severity: 'critical',
        message: 'Disk usage is above 95%',
      },
      {
        id: 'error_rate_high',
        type: 'performance',
        condition: 'error_rate_high',
        threshold: 5,
        enabled: true,
        severity: 'medium',
        message: 'Error rate is above 5%',
      },
      {
        id: 'response_time_high',
        type: 'performance',
        condition: 'response_time_high',
        threshold: 2000,
        enabled: true,
        severity: 'medium',
        message: 'Response time is above 2 seconds',
      },
      {
        id: 'failed_login',
        type: 'security',
        condition: 'failed_login',
        threshold: 5,
        enabled: true,
        severity: 'high',
        message: 'Multiple failed login attempts detected',
      },
      {
        id: 'large_transaction',
        type: 'business',
        condition: 'large_transaction',
        threshold: 1000000,
        enabled: false,
        severity: 'low',
        message: 'Large transaction detected',
      },
    ];
  }

  // Check metrics against alert conditions
  async checkAlerts(metrics: any) {
    for (const alert of this.alerts) {
      if (!alert.enabled) continue;

      let triggered = false;
      let currentValue = 0;

      switch (alert.condition) {
        case 'cpu_high':
          currentValue = metrics.system?.cpu?.usage_percent || 0;
          triggered = currentValue > alert.threshold;
          break;
        case 'memory_high':
          currentValue = metrics.system?.memory?.usage_percent || 0;
          triggered = currentValue > alert.threshold;
          break;
        case 'disk_high':
          currentValue = metrics.system?.disk?.usage_percent || 0;
          triggered = currentValue > alert.threshold;
          break;
        case 'error_rate_high':
          currentValue = metrics.application?.error_rate_percent || 0;
          triggered = currentValue > alert.threshold;
          break;
        case 'response_time_high':
          currentValue = metrics.application?.response_time_ms || 0;
          triggered = currentValue > alert.threshold;
          break;
        // Add more conditions as needed
      }

      if (triggered) {
        await this.sendAlert(alert, currentValue);
      }
    }
  }

  private async sendAlert(alert: AlertConfig, currentValue: number) {
    const channelId = this.getChannelIdForAlert(alert.type);
    const title = this.getAlertTitle(alert.severity);
    const message = `${alert.message} (Current: ${currentValue})`;

    PushNotification.localNotification({
      channelId,
      title,
      message,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      data: {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity,
      },
    });

    // Log alert to backend
    try {
      await fetch('/v1/admin/alerts/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId: alert.id,
          type: alert.type,
          severity: alert.severity,
          message,
          currentValue,
          threshold: alert.threshold,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to log alert:', error);
    }
  }

  private getChannelIdForAlert(type: string): string {
    switch (type) {
      case 'system_health':
      case 'security':
        return 'system-alerts';
      case 'performance':
        return 'performance-alerts';
      default:
        return 'system-alerts';
    }
  }

  private getAlertTitle(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🚨 CRITICAL ALERT';
      case 'high':
        return '⚠️ HIGH PRIORITY ALERT';
      case 'medium':
        return '🔔 ALERT';
      case 'low':
        return 'ℹ️ NOTIFICATION';
      default:
        return 'ALERT';
    }
  }

  // Public API methods
  async getAlerts(): Promise<AlertConfig[]> {
    return [...this.alerts];
  }

  async updateAlert(alertId: string, updates: Partial<AlertConfig>): Promise<void> {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      this.alerts[index] = { ...this.alerts[index], ...updates };
      await this.saveAlertsConfig();
    }
  }

  async enableAlert(alertId: string): Promise<void> {
    await this.updateAlert(alertId, { enabled: true });
  }

  async disableAlert(alertId: string): Promise<void> {
    await this.updateAlert(alertId, { enabled: false });
  }

  async testAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      await this.sendAlert(alert, alert.threshold + 1);
    }
  }

  // Send custom notification
  async sendCustomNotification(title: string, message: string, data?: any) {
    PushNotification.localNotification({
      channelId: 'system-alerts',
      title,
      message,
      playSound: true,
      soundName: 'default',
      data,
    });
  }

  // Clear all notifications
  clearAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Get notification permissions status
  async getPermissionsStatus() {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions);
      });
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;