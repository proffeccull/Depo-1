import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import winston from 'winston';

export interface AnalyticsEventInput {
  eventType: string;
  eventData?: any;
  userId?: string;
  sessionId?: string;
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface AnalyticsQuery {
  eventType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  uniqueUsers: number;
  topEvents: Array<{ eventType: string; count: number }>;
  dailyStats: Array<{ date: string; count: number }>;
  conversionRates: Record<string, number>;
  retentionMetrics: {
    day1: number;
    day7: number;
    day30: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
  };
}

export interface UserBehaviorAnalysis {
  sessionDuration: number;
  pageViews: number;
  bounceRate: number;
  conversionFunnel: Array<{ step: string; users: number; dropoffRate: number }>;
  heatmapData: Array<{ x: number; y: number; intensity: number }>;
}

export interface CohortAnalysis {
  cohortMonth: string;
  totalUsers: number;
  retentionByMonth: Record<string, number>;
}

@injectable()
export class AnalyticsService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Logger') private logger: winston.Logger
  ) {}

  async trackEvent(eventData: AnalyticsEventInput): Promise<void> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          eventType: eventData.eventType,
          eventData: eventData.eventData || {},
          userId: eventData.userId,
          sessionId: eventData.sessionId,
          deviceInfo: eventData.deviceInfo,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
        },
      });

      // Track real-time metrics
      await this.updateRealTimeMetrics(eventData.eventType, eventData.userId);

      this.logger.info('Analytics event tracked', { 
        eventType: eventData.eventType,
        userId: eventData.userId 
      });
    } catch (error) {
      this.logger.error('Failed to track analytics event', { error, eventData });
      throw new Error('EVENT_TRACKING_FAILED');
    }
  }

  async trackBulkEvents(events: AnalyticsEventInput[]): Promise<void> {
    try {
      await this.prisma.analyticsEvent.createMany({
        data: events.map(event => ({
          eventType: event.eventType,
          eventData: event.eventData || {},
          userId: event.userId,
          sessionId: event.sessionId,
          deviceInfo: event.deviceInfo,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
        })),
      });

      this.logger.info('Bulk analytics events tracked', { count: events.length });
    } catch (error) {
      this.logger.error('Failed to track bulk analytics events', { error });
      throw new Error('BULK_EVENT_TRACKING_FAILED');
    }
  }

  async getEvents(query: AnalyticsQuery): Promise<any[]> {
    try {
      const where: any = {};
      
      if (query.eventType) where.eventType = query.eventType;
      if (query.userId) where.userId = query.userId;
      if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) where.createdAt.gte = query.startDate;
        if (query.endDate) where.createdAt.lte = query.endDate;
      }

      return await this.prisma.analyticsEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit || 100,
        skip: query.offset || 0,
      });
    } catch (error) {
      this.logger.error('Failed to fetch analytics events', { error, query });
      throw new Error('ANALYTICS_FETCH_FAILED');
    }
  }

  async getMetrics(startDate: Date, endDate: Date): Promise<AnalyticsMetrics> {
    try {
      const [totalEvents, uniqueUsers, topEvents, dailyStats, conversionRates, retentionMetrics, revenueMetrics] = await Promise.all([
        this.prisma.analyticsEvent.count({
          where: { createdAt: { gte: startDate, lte: endDate } }
        }),
        this.prisma.analyticsEvent.findMany({
          where: { 
            createdAt: { gte: startDate, lte: endDate },
            userId: { not: null }
          },
          select: { userId: true },
          distinct: ['userId']
        }).then(results => results.length),
        this.prisma.analyticsEvent.groupBy({
          by: ['eventType'],
          where: { createdAt: { gte: startDate, lte: endDate } },
          _count: { eventType: true },
          orderBy: { _count: { eventType: 'desc' } },
          take: 10
        }),
        this.prisma.$queryRaw`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM analytics_events 
          WHERE created_at >= ${startDate} AND created_at <= ${endDate}
          GROUP BY DATE(created_at)
          ORDER BY date
        `,
        this.calculateConversionRates(startDate, endDate),
        this.calculateRetentionMetrics(startDate, endDate),
        this.calculateRevenueMetrics(startDate, endDate)
      ]);

      return {
        totalEvents,
        uniqueUsers,
        topEvents: topEvents.map(event => ({
          eventType: event.eventType,
          count: event._count.eventType
        })),
        dailyStats: dailyStats as Array<{ date: string; count: number }>,
        conversionRates,
        retentionMetrics,
        revenueMetrics
      };
    } catch (error) {
      this.logger.error('Failed to get analytics metrics', { error });
      throw new Error('ANALYTICS_METRICS_FAILED');
    }
  }

  async getUserActivity(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const events = await this.prisma.analyticsEvent.findMany({
        where: {
          userId,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' }
      });

      const eventsByType = events.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sessionAnalysis = await this.analyzeUserSessions(userId, startDate);

      return {
        totalEvents: events.length,
        eventsByType,
        lastActivity: events[0]?.createdAt,
        activeDays: new Set(events.map(e => e.createdAt.toDateString())).size,
        sessionAnalysis,
        engagementScore: this.calculateEngagementScore(events)
      };
    } catch (error) {
      this.logger.error('Failed to get user activity', { error, userId });
      throw new Error('USER_ACTIVITY_FAILED');
    }
  }

  async getUserBehaviorAnalysis(userId: string, startDate: Date, endDate: Date): Promise<UserBehaviorAnalysis> {
    try {
      const events = await this.prisma.analyticsEvent.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate }
        },
        orderBy: { createdAt: 'asc' }
      });

      const sessions = this.groupEventsBySessions(events);
      const avgSessionDuration = sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length;
      const pageViews = events.filter(e => e.eventType === 'page_view').length;
      const bounceRate = sessions.filter(s => s.events.length === 1).length / sessions.length;

      return {
        sessionDuration: avgSessionDuration,
        pageViews,
        bounceRate,
        conversionFunnel: await this.calculateConversionFunnel(userId, startDate, endDate),
        heatmapData: await this.generateHeatmapData(userId, startDate, endDate)
      };
    } catch (error) {
      this.logger.error('Failed to analyze user behavior', { error, userId });
      throw new Error('USER_BEHAVIOR_ANALYSIS_FAILED');
    }
  }

  async getCohortAnalysis(startDate: Date, endDate: Date): Promise<CohortAnalysis[]> {
    try {
      const cohorts = await this.prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(u.created_at, '%Y-%m') as cohort_month,
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN ae.created_at IS NOT NULL THEN u.id END) as retained_users
        FROM users u
        LEFT JOIN analytics_events ae ON u.id = ae.user_id 
          AND ae.created_at BETWEEN ${startDate} AND ${endDate}
        WHERE u.created_at BETWEEN ${startDate} AND ${endDate}
        GROUP BY cohort_month
        ORDER BY cohort_month
      ` as any[];

      return cohorts.map(cohort => ({
        cohortMonth: cohort.cohort_month,
        totalUsers: cohort.total_users,
        retentionByMonth: {} // Would calculate detailed retention here
      }));
    } catch (error) {
      this.logger.error('Failed to get cohort analysis', { error });
      throw new Error('COHORT_ANALYSIS_FAILED');
    }
  }

  async exportAnalyticsData(query: AnalyticsQuery, format: 'csv' | 'json' | 'xlsx'): Promise<Buffer | string> {
    try {
      const events = await this.getEvents(query);
      
      switch (format) {
        case 'csv':
          return this.convertToCSV(events);
        case 'json':
          return JSON.stringify(events, null, 2);
        case 'xlsx':
          return await this.convertToXLSX(events);
        default:
          throw new Error('UNSUPPORTED_FORMAT');
      }
    } catch (error) {
      this.logger.error('Failed to export analytics data', { error, query, format });
      throw new Error('EXPORT_FAILED');
    }
  }

  async getRealTimeMetrics(): Promise<any> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const [activeUsers, recentEvents, topPages] = await Promise.all([
        this.prisma.analyticsEvent.findMany({
          where: { createdAt: { gte: oneHourAgo } },
          select: { userId: true },
          distinct: ['userId']
        }).then(results => results.length),
        this.prisma.analyticsEvent.count({
          where: { createdAt: { gte: oneHourAgo } }
        }),
        this.prisma.analyticsEvent.groupBy({
          by: ['eventData'],
          where: { 
            eventType: 'page_view',
            createdAt: { gte: oneHourAgo }
          },
          _count: { eventType: true },
          orderBy: { _count: { eventType: 'desc' } },
          take: 5
        })
      ]);

      return {
        activeUsers,
        recentEvents,
        topPages,
        timestamp: now.toISOString()
      };
    } catch (error) {
      this.logger.error('Failed to get real-time metrics', { error });
      throw new Error('REALTIME_METRICS_FAILED');
    }
  }

  private async updateRealTimeMetrics(eventType: string, userId?: string): Promise<void> {
    // Update Redis or in-memory cache for real-time dashboard
    // Implementation would depend on caching strategy
  }

  private async calculateConversionRates(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    const funnelSteps = ['page_view', 'signup_start', 'signup_complete', 'first_donation'];
    const rates: Record<string, number> = {};

    for (let i = 0; i < funnelSteps.length - 1; i++) {
      const currentStep = funnelSteps[i];
      const nextStep = funnelSteps[i + 1];

      const [currentCount, nextCount] = await Promise.all([
        this.prisma.analyticsEvent.count({
          where: { eventType: currentStep, createdAt: { gte: startDate, lte: endDate } }
        }),
        this.prisma.analyticsEvent.count({
          where: { eventType: nextStep, createdAt: { gte: startDate, lte: endDate } }
        })
      ]);

      rates[`${currentStep}_to_${nextStep}`] = currentCount > 0 ? nextCount / currentCount : 0;
    }

    return rates;
  }

  private async calculateRetentionMetrics(startDate: Date, endDate: Date): Promise<any> {
    // Calculate day 1, 7, and 30 retention rates
    const day1 = await this.calculateRetentionForPeriod(startDate, endDate, 1);
    const day7 = await this.calculateRetentionForPeriod(startDate, endDate, 7);
    const day30 = await this.calculateRetentionForPeriod(startDate, endDate, 30);

    return { day1, day7, day30 };
  }

  private async calculateRetentionForPeriod(startDate: Date, endDate: Date, days: number): Promise<number> {
    // Implementation for retention calculation
    return 0.75; // Placeholder
  }

  private async calculateRevenueMetrics(startDate: Date, endDate: Date): Promise<any> {
    // Calculate revenue-related metrics from donation and coin purchase events
    return {
      totalRevenue: 0,
      averageOrderValue: 0,
      conversionRate: 0
    };
  }

  private async analyzeUserSessions(userId: string, startDate: Date): Promise<any> {
    // Analyze user session patterns
    return {
      averageSessionDuration: 0,
      sessionsPerDay: 0,
      mostActiveHours: []
    };
  }

  private calculateEngagementScore(events: any[]): number {
    // Calculate user engagement score based on events
    return Math.min(100, events.length * 2);
  }

  private groupEventsBySessions(events: any[]): any[] {
    // Group events into sessions based on time gaps
    return [];
  }

  private async calculateConversionFunnel(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // Calculate conversion funnel for specific user
    return [];
  }

  private async generateHeatmapData(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // Generate heatmap data for user interactions
    return [];
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }

  private async convertToXLSX(data: any[]): Promise<Buffer> {
    // Implementation would use a library like xlsx
    return Buffer.from(''); // Placeholder
  }
}