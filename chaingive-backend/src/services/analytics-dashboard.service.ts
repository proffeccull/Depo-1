import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class AnalyticsDashboardService {
  async getDonationTrends(period: string) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const donations = await prisma.donation.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: startDate } },
      _sum: { amount: true },
      _count: true,
    });

    return donations.map(d => ({
      date: d.createdAt.toISOString().split('T')[0],
      amount: d._sum.amount || 0,
      count: d._count,
    }));
  }

  async getUserEngagement() {
    const [dau, mau, retention] = await Promise.all([
      this.getDailyActiveUsers(),
      this.getMonthlyActiveUsers(),
      this.getRetentionRate(),
    ]);

    return { dau, mau, retention };
  }

  async getConversionFunnel() {
    const [registered, donated, recurring] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { donations: { some: {} } } }),
      prisma.recurringDonation.count({ where: { status: 'active' } }),
    ]);

    return {
      registered,
      donated,
      recurring,
      conversionRate: ((donated / registered) * 100).toFixed(2),
      recurringRate: ((recurring / donated) * 100).toFixed(2),
    };
  }

  async getDonationHeatmap() {
    const donations = await prisma.donation.findMany({
      select: { createdAt: true, amount: true },
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    });

    const heatmap: any = {};
    donations.forEach(d => {
      const hour = d.createdAt.getHours();
      const day = d.createdAt.getDay();
      const key = `${day}-${hour}`;
      heatmap[key] = (heatmap[key] || 0) + 1;
    });

    return heatmap;
  }

  async getOverviewStats() {
    const [totalDonations, totalAmount, avgDonation, topCategory] = await Promise.all([
      prisma.donation.count(),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.donation.aggregate({ _avg: { amount: true } }),
      this.getTopCategory(),
    ]);

    return {
      totalDonations,
      totalAmount: totalAmount._sum.amount || 0,
      avgDonation: avgDonation._avg.amount || 0,
      topCategory,
    };
  }

  private async getDailyActiveUsers() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return prisma.user.count({
      where: { updatedAt: { gte: yesterday } },
    });
  }

  private async getMonthlyActiveUsers() {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return prisma.user.count({
      where: { updatedAt: { gte: lastMonth } },
    });
  }

  private async getRetentionRate() {
    return 75; // Placeholder - implement actual calculation
  }

  private async getTopCategory() {
    const result = await prisma.donation.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 1,
    });

    if (result.length === 0) return null;

    const category = await prisma.donationCategory.findUnique({
      where: { id: result[0].categoryId },
    });

    return category?.name;
  }
}

export default new AnalyticsDashboardService();
