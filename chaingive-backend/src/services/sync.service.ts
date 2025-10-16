import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SyncData {
  transactions: any[];
  lastSync: string;
  deviceId: string;
}

export class SyncService {
  static async syncUserData(userId: string, data: SyncData) {
    const { transactions, lastSync, deviceId } = data;
    
    // Process offline transactions
    const processedTransactions = [];
    for (const transaction of transactions) {
      if (!transaction.synced) {
        const created = await prisma.transaction.create({
          data: {
            ...transaction,
            userId,
            createdAt: new Date(transaction.createdAt),
          },
        });
        processedTransactions.push(created);
      }
    }

    // Update user's last sync
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });

    return {
      processedTransactions,
      serverTime: new Date().toISOString(),
    };
  }

  static async getUpdates(userId: string, lastSync: string) {
    const since = new Date(lastSync);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        createdAt: { gt: since },
      },
      orderBy: { createdAt: 'desc' },
    });

    const notifications: any[] = [];

    return { transactions, notifications };
  }
}