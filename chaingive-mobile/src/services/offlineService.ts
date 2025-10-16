import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface OfflineAction {
  id: string;
  type: 'donation' | 'transaction' | 'profile_update';
  data: any;
  timestamp: number;
}

class OfflineService {
  private queue: OfflineAction[] = [];
  private isProcessing = false;

  async addToQueue(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
    const offlineAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    this.queue.push(offlineAction);
    await this.saveQueue();
  }

  async processQueue() {
    if (this.isProcessing) return;
    
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;

    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const action = this.queue.shift()!;
      try {
        await this.executeAction(action);
      } catch (error) {
        console.error('Failed to process offline action:', error);
        this.queue.unshift(action); // Put back at front
        break;
      }
    }

    await this.saveQueue();
    this.isProcessing = false;
  }

  private async executeAction(action: OfflineAction) {
    // Execute the queued action when online
    console.log('Executing offline action:', action);
  }

  private async saveQueue() {
    await AsyncStorage.setItem('offline_queue', JSON.stringify(this.queue));
  }

  async loadQueue() {
    const saved = await AsyncStorage.getItem('offline_queue');
    this.queue = saved ? JSON.parse(saved) : [];
  }
}

export const offlineService = new OfflineService();