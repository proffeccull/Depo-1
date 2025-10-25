import { Injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    completionRate: number;
    topCategories: Array<{ category: string; amount: number; count: number }>;
    geographicDistribution: Array<{ location: string; users: number; donations: number }>;
    hourlyActivity: Array<{ hour: number; donations: number }>;
  };
}

export interface UserBehavior {
  userId: string;
  sessionDuration: number;
  pagesViewed: string[];
  actionsPerformed: string[];
  deviceInfo: {
    type: string;
    os: string;
    browser?: string;
  };
  location?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Get comprehensive analytics data
   */
  async getAnalyticsData(
    period: 'day' | 'week' | 'month' | 'year' = 'month',
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsData> {
    try {
      const { start, end } = this.calculateDateRange(period, startDate, endDate);

      const [
        userStats,
        donationStats,
        categoryStats,
        geographicStats,
        hourlyStats
      ] = await Promise.all([
        this.getUserStatistics(start, end),
        this.getDonationStatistics(start, end),
        this.getCategoryStatistics(start, end),
        this.getGeographicStatistics(start, end),
        this.getHourlyActivity(start, end)
      ]);

      return {
        period,
        startDate: start,
        endDate: end,
        metrics: {
          totalUsers: userStats.total,
          activeUsers: userStats.active,
          newUsers: userStats.new,
          totalDonations: donationStats.total,
          totalAmount: donationStats.amount,
          averageDonation: donationStats.average,
          completionRate: donationStats.completionRate,
          topCategories: categoryStats,
          geographicDistribution: geographicStats,
          hourlyActivity: hourlyStats
        }
      };
    } catch (error) {
      logger.error('Error getting analytics data', { period, error: error.message });
      throw error;
    }
  }

  /**
   * Track user behavior
   */
  async trackUserBehavior(behavior: UserBehavior): Promise<void> {
    try {
      await this.prisma.userAnalytics.create({
        data: {
          userId: behavior.userId,
          sessionDuration: behavior.sessionDuration,
          pagesViewed: behavior.pagesViewed,
          actionsPerformed: behavior.actionsPerformed,
          deviceType: behavior.deviceInfo.type,
          deviceOS: behavior.deviceInfo.os,
          deviceBrowser: behavior.deviceInfo.browser,
          location: behavior.location,
          createdAt: new Date()
        }
      });

      logger.info('User behavior tracked', { userId: behavior.userId });
    } catch (error) {
      logger.error('Error tracking user behavior', { userId: behavior.userId, error: error.message });
    }
  }

  /**
   * Get user retention metrics
   */
  async getRetentionMetrics(cohortDate: Date): Promise<{
    cohort: Date;
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  }> {
    try {
      const cohortUsers = await this.prisma.user.findMany({
        where: {
          createdAt: {
            gte: cohortDate,
            lt: new Date(cohortDate.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        select: { id: true, createdAt: true }
      });

      const cohortSize = cohortUsers.length;
      if (cohortSize === 0) {
        return {
          cohort: cohortDate,
          day1: 0,
          day7: 0,
          day30: 0,
          day90: 0
        };
      }

      const retention = await Promise.all([
        this.calculateRetention(cohortUsers, 1),
        this.calculateRetention(cohortUsers, 7),
        this.calculateRetention(cohortUsers, 30),
        this.calculateRetention(cohortUsers, 90)
      ]);

      return {
        cohort: cohortDate,
        day1: (retention[0] / cohortSize) * 100,
        day7: (retention[1] / cohortSize) * 100,
        day30: (retention[2] / cohortSize) * 100,
        day90: (retention[3] / cohortSize) * 100
      };
    } catch (error) {
      logger.error('Error calculating retention metrics', { cohortDate, error: error.message });
      throw error;
    }
  }

  /**
   * Get donation funnel analysis
   */
  async getDonationFunnel(): Promise<{
    awareness: number;
    interest: number;
    consideration: number;
    intent: number;
    donation: number;
  }> {
    try {
      // This would track the donation funnel stages
      // Implementation depends on specific tracking events
      return {
        awareness: 1000,
        interest: 800,
        consideration: 600,
        intent: 400,
        donation: 200
      };
    } catch (error) {
      logger.error('Error getting donation funnel', { error: error.message });
      throw error;
    }
  }

  /**
   * Get predictive analytics for user behavior
   */
  async getPredictiveInsights(userId: string): Promise<{
    likelyToDonate: number;
    preferredAmount: number;
    preferredCategory: string;
    nextDonationDate: Date;
  }> {
    try {
      // Simple predictive logic based on historical data
      const userHistory = await this.prisma.donation.findMany({
        where: {
          donorId: userId,
          status: 'completed'
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      if (userHistory.length === 0) {
        return {
          likelyToDonate: 0.5,
          preferredAmount: 5000,
          preferredCategory: 'general',
          nextDonationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
      }

      const averageAmount = userHistory.reduce((sum, d) => sum + d.amount, 0) / userHistory.length;
      const categories = userHistory.map(d => d.category);
      const preferredCategory = categories.sort((a, b) =>
        categories.filter(v => v === a).length - categories.filter(v => v === b).length
      ).pop() || 'general';

      // Calculate donation frequency
      const dates = userHistory.map(d => d.createdAt.getTime()).sort();
      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        intervals.push(dates[i] - dates[i - 1]);
      }
      const avgInterval = intervals.length > 0
        ? intervals.reduce((a, b) => a + b, 0) / intervals.length
        : 30 * 24 * 60 * 60 * 1000; // 30 days default

      const lastDonation = userHistory[0].createdAt;
      const nextDonationDate = new Date(lastDonation.getTime() + avgInterval);

      return {
        likelyToDonate: Math.min(userHistory.length / 10, 1), // Simple likelihood based on history
        preferredAmount: Math.round(averageAmount),
        preferredCategory,
        nextDonationDate
      };
    } catch (error) {
      logger.error('Error getting predictive insights', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Export analytics data for reporting
   */
  async exportAnalyticsData(
    format: 'json' | 'csv' = 'json',
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    try {
      const data = await this.getAnalyticsData('month', startDate, endDate);

      if (format === 'csv') {
        return this.convertToCSV(data);
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      logger.error('Error exporting analytics data', { format, error: error.message });
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private calculateDateRange(
    period: string,
    startDate?: Date,
    endDate?: Date
  ): { start: Date; end: Date } {
    if (startDate && endDate) {
      return { start: startDate, end: endDate };
    }

    const end = new Date();
    let start = new Date();

    switch (period) {
      case 'day':
        start.setDate(end.getDate() - 1);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    return { start, end };
  }

  private async getUserStatistics(start: Date, end: Date): Promise<{
    total: number;
    active: number;
    new: number;
  }> {
    const [total, active, newUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          lastLoginAt: { gte: start }
        }
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      })
    ]);

    return { total, active, new: newUsers };
  }

  private async getDonationStatistics(start: Date, end: Date): Promise<{
    total: number;
    amount: number;
    average: number;
    completionRate: number;
  }> {
    const donations = await this.prisma.donation.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      }
    });

    const total = donations.length;
    const amount = donations.reduce((sum, d) => sum + d.amount, 0);
    const average = total > 0 ? amount / total : 0;
    const completed = donations.filter(d => d.status === 'completed').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, amount, average, completionRate };
  }

  private async getCategoryStatistics(start: Date, end: Date): Promise<Array<{
    category: string;
    amount: number;
    count: number;
  }>> {
    const result = await this.prisma.donation.groupBy({
      by: ['category'],
      where: {
        createdAt: { gte: start, lte: end },
        status: 'completed'
      },
      _count: { category: true },
      _sum: { amount: true }
    });

    return result.map(item => ({
      category: item.category,
      amount: item._sum.amount || 0,
      count: item._count.category
    })).sort((a, b) => b.amount - a.amount);
  }

  private async getGeographicStatistics(start: Date, end: Date): Promise<Array<{
    location: string;
    users: number;
    donations: number;
  }>> {
    // Simplified geographic stats - would need location tracking
    return [];
  }

  private async getHourlyActivity(start: Date, end: Date): Promise<Array<{
    hour: number;
    donations: number;
  }>> {
    const result = await this.prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
      SELECT
        EXTRACT(hour from "createdAt") as hour,
        COUNT(*) as count
      FROM donations
      WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY EXTRACT(hour from "createdAt")
      ORDER BY hour
    `;

    return result.map(item => ({
      hour: Number(item.hour),
      donations: Number(item.count)
    }));
  }

  private async calculateRetention(users: any[], days: number): Promise<number> {
    const retentionDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const retainedUsers = await this.prisma.user.count({
      where: {
        id: { in: users.map(u => u.id) },
        lastLoginAt: { gte: retentionDate }
      }
    });

    return retainedUsers;
  }

  private convertToCSV(data: AnalyticsData): string {
    // Simple CSV conversion - would need proper CSV library for complex data
    return `Period,${data.period}\nStart Date,${data.startDate.toISOString()}\nEnd Date,${data.endDate.toISOString()}\nTotal Users,${data.metrics.totalUsers}\nActive Users,${data.metrics.activeUsers}\nNew Users,${data.metrics.newUsers}\nTotal Donations,${data.metrics.totalDonations}\nTotal Amount,${data.metrics.totalAmount}\nAverage Donation,${data.metrics.averageDonation}\nCompletion Rate,${data.metrics.completionRate}`;
  }
}

export default AnalyticsService;