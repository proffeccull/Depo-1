import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

class FundraisingService {
  async getThermometerData(categoryId: string) {
    const donations = await prisma.donation.aggregate({
      where: { categoryId },
      _sum: { amount: true },
      _count: true,
    });

    const category = await prisma.donationCategory.findUnique({
      where: { id: categoryId },
      select: { name: true },
    });

    const raised = donations._sum.amount || 0;
    const goal = raised * 1.5; // Dynamic goal: 150% of current
    const percentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

    return {
      categoryId,
      title: category?.name,
      raised,
      goal,
      percentage: Math.round(percentage),
      donorCount: donations._count,
      milestones: this.calculateMilestones(raised, goal),
    };
  }

  private calculateMilestones(raised: number, goal: number) {
    const milestones = [25, 50, 75, 100];
    return milestones.map(m => ({
      percentage: m,
      amount: (goal * m) / 100,
      reached: raised >= (goal * m) / 100,
    }));
  }

  async getLeaderboardWithBadges(type: string, period: string) {
    const dateFilter = this.getDateFilter(period);
    
    const topUsers = await prisma.donation.groupBy({
      by: ['userId'],
      where: dateFilter,
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: 100,
    });

    const usersWithBadges = await Promise.all(
      topUsers.map(async (entry, index) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: { id: true, firstName: true, lastName: true, profilePicture: true },
        });

        const badges = await this.calculateBadges(entry._sum.amount || 0, entry._count);

        return {
          rank: index + 1,
          user,
          totalDonated: entry._sum.amount || 0,
          donationCount: entry._count,
          badges,
        };
      })
    );

    return { leaderboard: usersWithBadges };
  }

  private getDateFilter(period: string) {
    const now = new Date();
    switch (period) {
      case 'week':
        return { createdAt: { gte: new Date(now.setDate(now.getDate() - 7)) } };
      case 'month':
        return { createdAt: { gte: new Date(now.setMonth(now.getMonth() - 1)) } };
      case 'year':
        return { createdAt: { gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
      default:
        return {};
    }
  }

  private async calculateBadges(totalDonated: number, donationCount: number) {
    const badges = [];

    if (totalDonated >= 10000) badges.push({ name: 'Diamond Donor', icon: '💎', tier: 'diamond' });
    else if (totalDonated >= 5000) badges.push({ name: 'Platinum Donor', icon: '🏆', tier: 'platinum' });
    else if (totalDonated >= 1000) badges.push({ name: 'Gold Donor', icon: '🥇', tier: 'gold' });
    else if (totalDonated >= 500) badges.push({ name: 'Silver Donor', icon: '🥈', tier: 'silver' });
    else if (totalDonated >= 100) badges.push({ name: 'Bronze Donor', icon: '🥉', tier: 'bronze' });

    if (donationCount >= 100) badges.push({ name: 'Century Club', icon: '💯', tier: 'special' });
    else if (donationCount >= 50) badges.push({ name: 'Generous Giver', icon: '🎁', tier: 'special' });
    else if (donationCount >= 10) badges.push({ name: 'Regular Donor', icon: '⭐', tier: 'special' });

    return badges;
  }

  async getUserBadges(userId: string) {
    const stats = await prisma.donation.aggregate({
      where: { userId },
      _sum: { amount: true },
      _count: true,
    });

    const totalDonated = stats._sum.amount || 0;
    const donationCount = stats._count;

    return this.calculateBadges(totalDonated, donationCount);
  }
}

export default new FundraisingService();
