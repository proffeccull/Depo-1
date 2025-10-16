import { performanceService } from './performanceService';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userId?: string;

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        userId: this.userId,
        platform: 'mobile',
      },
      timestamp: Date.now(),
    };

    this.events.push(event);
    
    // Auto-flush every 10 events
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  trackPerformance(screenName: string, loadTime: number) {
    this.track('screen_performance', {
      screen: screenName,
      loadTime,
      averageLoadTime: performanceService.getAverageTime(screenName),
    });
  }

  trackError(error: Error, context?: string) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  async flush() {
    if (this.events.length === 0) return;

    try {
      // Send events to analytics service
      console.log('Flushing analytics events:', this.events.length);
      this.events = [];
    } catch (error) {
      console.error('Failed to flush analytics:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();