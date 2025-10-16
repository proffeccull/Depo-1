import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '../utils/trpc';

interface PendingTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
  createdAt: string;
  synced: boolean;
}

export class SyncService {
  private static PENDING_KEY = 'pending_transactions';
  private static LAST_SYNC_KEY = 'last_sync';

  static async addPendingTransaction(transaction: Omit<PendingTransaction, 'id' | 'synced'>) {
    const pending = await this.getPendingTransactions();
    const newTransaction: PendingTransaction = {
      ...transaction,
      id: Date.now().toString(),
      synced: false,
    };
    
    pending.push(newTransaction);
    await AsyncStorage.setItem(this.PENDING_KEY, JSON.stringify(pending));
    return newTransaction;
  }

  static async getPendingTransactions(): Promise<PendingTransaction[]> {
    const stored = await AsyncStorage.getItem(this.PENDING_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static async syncWithServer() {
    const pending = await this.getPendingTransactions();
    const lastSync = await AsyncStorage.getItem(this.LAST_SYNC_KEY) || new Date(0).toISOString();

    if (pending.length > 0) {
      const result = await trpc.sync.syncData.mutate({
        transactions: pending,
        lastSync,
        deviceId: 'mobile-app',
      });

      // Clear synced transactions
      await AsyncStorage.setItem(this.PENDING_KEY, JSON.stringify([]));
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, result.serverTime);
    }

    // Get updates from server
    const updates = await trpc.sync.getUpdates.query({ lastSync });
    return updates;
  }
}