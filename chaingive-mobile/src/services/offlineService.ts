import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

export interface OfflineAction {
  id: string;
  type: 'donation_request' | 'donation_accept' | 'coin_purchase' | 'profile_update';
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingActions: number;
  syncInProgress: boolean;
}

class OfflineService {
  private static instance: OfflineService;
  private syncInProgress = false;
  private listeners: ((status: SyncStatus) => void)[] = [];

  private constructor() {
    this.setupNetworkListener();
    this.setupAppStateListener();
  }

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  /**
   * Setup network connectivity listener
   */
  private setupNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable;
      this.notifyListeners();
      if (isOnline) {
        this.performBackgroundSync();
      }
    });
  }

  /**
   * Setup app state listener for background sync
   */
  private setupAppStateListener(): void {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        this.performBackgroundSync();
      }
    });
  }

  /**
   * Queue an action for offline execution
   */
  async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const offlineAction: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    const existingActions = await this.getQueuedActions();
    existingActions.push(offlineAction);

    await AsyncStorage.setItem('offline_actions', JSON.stringify(existingActions));
    this.notifyListeners();
  }

  /**
   * Get all queued offline actions
   */
  private async getQueuedActions(): Promise<OfflineAction[]> {
    try {
      const actionsJson = await AsyncStorage.getItem('offline_actions');
      return actionsJson ? JSON.parse(actionsJson) : [];
    } catch (error) {
      console.error('Failed to get queued actions:', error);
      return [];
    }
  }

  /**
   * Remove a completed action from queue
   */
  private async removeAction(actionId: string): Promise<void> {
    const actions = await this.getQueuedActions();
    const filteredActions = actions.filter(action => action.id !== actionId);
    await AsyncStorage.setItem('offline_actions', JSON.stringify(filteredActions));
    this.notifyListeners();
  }

  /**
   * Update retry count for failed action
   */
  private async updateRetryCount(actionId: string): Promise<void> {
    const actions = await this.getQueuedActions();
    const actionIndex = actions.findIndex(action => action.id === actionId);

    if (actionIndex !== -1) {
      actions[actionIndex].retryCount += 1;
      await AsyncStorage.setItem('offline_actions', JSON.stringify(actions));
    }
  }

  /**
   * Perform background synchronization
   */
  async performBackgroundSync(): Promise<void> {
    if (this.syncInProgress) return;

    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners();

    try {
      const actions = await this.getQueuedActions();
      const maxRetries = 3;

      for (const action of actions) {
        if (action.retryCount >= maxRetries) {
          console.warn(`Action ${action.id} exceeded max retries, removing`);
          await this.removeAction(action.id);
          continue;
        }

        try {
          await this.executeAction(action);
          await this.removeAction(action.id);
          console.log(`Successfully synced action: ${action.id}`);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          await this.updateRetryCount(action.id);
        }
      }

      // Update last sync time
      await AsyncStorage.setItem('last_sync_time', Date.now().toString());

    } catch (error) {
      console.error('Background sync failed:', error);
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  /**
   * Execute a queued action
   */
  private async executeAction(action: OfflineAction): Promise<void> {
    // Import API client dynamically to avoid circular dependencies
    const { default: apiClient } = await import('./apiClient');

    switch (action.type) {
      case 'donation_request':
        await apiClient.post('/cycles/request', action.data);
        break;

      case 'donation_accept':
        await apiClient.post('/cycles/accept', action.data);
        break;

      case 'coin_purchase':
        await apiClient.post('/coins/purchase', action.data);
        break;

      case 'profile_update':
        await apiClient.put('/users/profile', action.data);
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const networkState = await NetInfo.fetch();
    const actions = await this.getQueuedActions();
    const lastSyncTimeStr = await AsyncStorage.getItem('last_sync_time');

    return {
      isOnline: networkState.isConnected && networkState.isInternetReachable,
      lastSyncTime: lastSyncTimeStr ? parseInt(lastSyncTimeStr, 10) : null,
      pendingActions: actions.length,
      syncInProgress: this.syncInProgress
    };
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<void> {
    await this.performBackgroundSync();
  }

  /**
   * Clear all queued actions (use with caution)
   */
  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem('offline_actions');
    this.notifyListeners();
  }

  /**
   * Add sync status listener
   */
  addSyncListener(callback: (status: SyncStatus) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of status change
   */
  private async notifyListeners(): Promise<void> {
    const status = await this.getSyncStatus();
    this.listeners.forEach(callback => callback(status));
  }

  /**
   * Store data locally for offline access
   */
  async storeOfflineData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`offline_data_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`Failed to store offline data for ${key}:`, error);
    }
  }

  /**
   * Retrieve locally stored offline data
   */
  async getOfflineData(key: string): Promise<any | null> {
    try {
      const stored = await AsyncStorage.getItem(`offline_data_${key}`);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return parsed.data;
    } catch (error) {
      console.error(`Failed to get offline data for ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear offline data cache
   */
  async clearOfflineCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter(key => key.startsWith('offline_data_'));
      await AsyncStorage.multiRemove(offlineKeys);
    } catch (error) {
      console.error('Failed to clear offline cache:', error);
    }
  }
}

export default OfflineService.getInstance();