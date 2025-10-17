import admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

class PushNotificationService {
  async sendBadgeUnlock(userId: string, badge: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) return;

    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: '🎉 New Badge Unlocked!',
        body: `You earned the ${badge.name} ${badge.icon} badge!`,
      },
      data: { type: 'badge_unlock', badge: JSON.stringify(badge) },
    });

    logger.info(`Badge unlock notification sent to user ${userId}`);
  }

  async sendMilestoneReached(userId: string, milestone: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) return;

    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: '🎯 Milestone Reached!',
        body: `${milestone.percentage}% complete - $${milestone.amount.toLocaleString()}`,
      },
      data: { type: 'milestone', milestone: JSON.stringify(milestone) },
    });
  }

  async sendLeaderboardUpdate(userId: string, rank: number, change: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) return;

    const emoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: `${emoji} Leaderboard Update`,
        body: `You're now ranked #${rank}!`,
      },
      data: { type: 'leaderboard', rank: rank.toString() },
    });
  }
}

export default new PushNotificationService();
