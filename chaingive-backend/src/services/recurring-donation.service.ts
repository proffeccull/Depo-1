import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

class RecurringDonationService {
  async create(data: any) {
    return prisma.recurringDonation.create({
      data: {
        ...data,
        status: 'active',
        nextProcessDate: data.startDate,
      },
    });
  }

  async getUserSubscriptions(userId: string) {
    return prisma.recurringDonation.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async pause(id: string) {
    return prisma.recurringDonation.update({
      where: { id },
      data: { status: 'paused' },
    });
  }

  async resume(id: string) {
    return prisma.recurringDonation.update({
      where: { id },
      data: { status: 'active' },
    });
  }

  async cancel(id: string) {
    return prisma.recurringDonation.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async processDue() {
    const due = await prisma.recurringDonation.findMany({
      where: {
        status: 'active',
        nextProcessDate: { lte: new Date() },
      },
    });

    for (const sub of due) {
      try {
        await prisma.donation.create({
          data: {
            userId: sub.userId,
            amount: sub.amount,
            categoryId: sub.categoryId,
            cycleId: await this.getCurrentCycleId(),
          },
        });

        await prisma.recurringDonation.update({
          where: { id: sub.id },
          data: {
            nextProcessDate: this.calculateNextDate(sub.frequency, sub.nextProcessDate),
            lastProcessedAt: new Date(),
          },
        });

        logger.info(`Processed recurring donation ${sub.id}`);
      } catch (error) {
        logger.error(`Failed to process recurring donation ${sub.id}:`, error);
      }
    }
  }

  private calculateNextDate(frequency: string, current: Date): Date {
    const next = new Date(current);
    switch (frequency) {
      case 'daily': next.setDate(next.getDate() + 1); break;
      case 'weekly': next.setDate(next.getDate() + 7); break;
      case 'monthly': next.setMonth(next.getMonth() + 1); break;
      case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
    }
    return next;
  }

  private async getCurrentCycleId(): Promise<string> {
    const cycle = await prisma.donationCycle.findFirst({
      where: {
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });
    return cycle?.id || '';
  }
}

export default new RecurringDonationService();
