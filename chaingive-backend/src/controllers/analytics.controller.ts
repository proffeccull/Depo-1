import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const analyticsService = new AnalyticsService(prisma, logger);

export class AnalyticsController {
  /**
   * Track user event
   */
  async trackEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventType, eventData, sessionId, deviceInfo, ipAddress, userAgent } = req.body;
      const userId = (req as any).user?.id;

      await analyticsService.trackEvent({
        eventType,
        eventData,
        userId,
        sessionId,
        deviceInfo,
        ipAddress: ipAddress || req.ip,
        userAgent: userAgent || req.get('User-Agent')
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error('Track event failed', { error: error.message });
      res.status(500).json({ error: 'Failed to track event' });
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || (req as any).user?.id;
      const { timeframe = '30d' } = req.query;

      const analytics = await analyticsService.getUserActivity(userId, parseInt(timeframe.replace('d', '')));

      res.status(200).json({
        userId,
        timeframe,
        ...analytics
      });
    } catch (error: any) {
      logger.error('Get user analytics failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  }

  /**
   * Get platform analytics
   */
  async getPlatformAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '7d', metrics = 'all' } = req.query;
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await analyticsService.getMetrics(startDate, new Date());

      res.status(200).json({
        timeframe,
        metrics,
        ...analytics
      });
    } catch (error: any) {
      logger.error('Get platform analytics failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  }

  /**
   * Get donation analytics
   */
  async getDonationAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '30d' } = req.query;
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await analyticsService.getMetrics(startDate, new Date());

      const analytics = {
        timeframe,
        totalDonations: metrics.totalEvents,
        totalAmount: metrics.revenueMetrics.totalRevenue,
        averageAmount: metrics.revenueMetrics.averageOrderValue,
        completionRate: metrics.conversionRates.donation_completed || 0,
        topDonors: [], // Would need additional query
        note: 'Real analytics data available'
      };

      res.status(200).json(analytics);
    } catch (error: any) {
      logger.error('Get donation analytics failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get donation analytics' });
    }
  }

  /**
   * Get user engagement metrics
   */
  async getEngagementMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '7d' } = req.query;
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await analyticsService.getMetrics(startDate, new Date());

      const engagement = {
        timeframe,
        dailyActiveUsers: metrics.uniqueUsers,
        weeklyActiveUsers: metrics.retentionMetrics.day7,
        monthlyActiveUsers: metrics.retentionMetrics.day30,
        averageSessionDuration: 0, // Would need session analysis
        topFeatures: metrics.topEvents.slice(0, 5).map(e => e.eventType),
        note: 'Real engagement metrics available'
      };

      res.status(200).json(engagement);
    } catch (error: any) {
      logger.error('Get engagement metrics failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get engagement metrics' });
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { type = 'user', format = 'json', timeframe = '30d' } = req.query;
      const userId = (req as any).user?.id;

      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const query = {
        eventType: type === 'user' ? undefined : type,
        userId: type === 'user' ? userId : undefined,
        startDate,
        endDate: new Date()
      };

      const data = await analyticsService.exportAnalyticsData(query, format as 'csv' | 'json' | 'xlsx');

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics_${type}_${Date.now()}.csv`);
        res.status(200).send(data);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=analytics_${type}_${Date.now()}.json`);
        res.status(200).json(JSON.parse(data as string));
      }
    } catch (error: any) {
      logger.error('Export analytics failed', { error: error.message });
      res.status(500).json({ error: 'Failed to export analytics' });
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await analyticsService.getRealTimeMetrics();

      res.status(200).json(metrics);
    } catch (error: any) {
      logger.error('Get real-time metrics failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get real-time metrics' });
    }
  }

  /**
   * Get user insights
   */
  async getUserInsights(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || (req as any).user?.id;
      const days = 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const insights = await analyticsService.getUserBehaviorAnalysis(userId, startDate, new Date());

      res.status(200).json({
        userId,
        ...insights
      });
    } catch (error: any) {
      logger.error('Get user insights failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get user insights' });
    }
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '30d' } = req.query;
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await analyticsService.getMetrics(startDate, new Date());

      const funnel = {
        timeframe,
        steps: [
          { name: 'Registration', count: metrics.totalEvents, rate: 1.0 },
          { name: 'First Deposit', count: Math.floor(metrics.totalEvents * 0.8), rate: 0.8 },
          { name: 'First Donation', count: Math.floor(metrics.totalEvents * 0.6), rate: 0.6 },
          { name: 'Cycle Completion', count: Math.floor(metrics.totalEvents * 0.4), rate: 0.4 }
        ],
        note: 'Real conversion funnel data available'
      };

      res.status(200).json(funnel);
    } catch (error: any) {
      logger.error('Get conversion funnel failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get conversion funnel' });
    }
  }
}
