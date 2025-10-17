import { PrismaClient } from '@prisma/client';
import websocketService from './websocket.service';

const prisma = new PrismaClient();

class BadgeNotificationService {
  async checkAndAwardBadges(userId: string) {
    const stats = await prisma.donation.aggregate({
      where: { userId },
      _sum: { amount: true },
      _count: true,
    });

    const newBadges = this.determineNewBadges(stats._sum.amount || 0, stats._count);
    
    for (const badge of newBadges) {
      await prisma.notification.create({
        data: {
          userId,
          message: `🎉 New badge unlocked: ${badge.name} ${badge.icon}`,
          read: false,
        },
      });

      websocketService.sendToUser(userId, 'badge:unlocked', badge);
    }

    return newBadges;
  }

  private determineNewBadges(total: number, count: number) {
    const badges = [];
    if (total >= 10000) badges.push({ name: 'Diamond Donor', icon: '💎', tier: 'diamond' });
    else if (total >= 5000) badges.push({ name: 'Platinum Donor', icon: '🏆', tier: 'platinum' });
    else if (total >= 1000) badges.push({ name: 'Gold Donor', icon: '🥇', tier: 'gold' });
    
    if (count >= 100) badges.push({ name: 'Century Club', icon: '💯', tier: 'special' });
    return badges;
  }
}

export default new BadgeNotificationService();
