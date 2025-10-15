import { Middleware } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../store';
import { updateCoinBalance } from '../slices/coinSlice';
import { wsManager, WSEventType } from '../../services/websocket';

// Actions that should trigger coin balance synchronization
const COIN_AFFECTING_ACTIONS = [
  'coin/earnCoins/fulfilled',
  'coin/spendCoins/fulfilled',
  'coin/purchaseCoins/fulfilled',
  'battlePass/claimBattlePassReward/fulfilled',
  'gamification/completeMission/fulfilled',
  'crew/distributeCrewRewards/fulfilled',
  'userLevels/unlockLevelPerk/fulfilled',
];

// Middleware to synchronize coin balance across screens
export const coinSyncMiddleware: Middleware<
  {},
  RootState,
  AppDispatch
> = (store) => (next) => (action) => {
  const result = next(action);

  // Check if this action affects coin balance
  if (COIN_AFFECTING_ACTIONS.includes(action.type)) {
    const state = store.getState();

    // Get the latest coin balance from auth slice (primary source)
    const authBalance = state.auth.user?.charityCoins;

    // Get balance from coin slice (secondary source)
    const coinBalance = state.coin.balance;

    // If balances differ, synchronize them
    if (authBalance !== undefined && authBalance !== coinBalance) {
      store.dispatch(updateCoinBalance({
        balance: authBalance,
        lastUpdated: new Date().toISOString(),
      }));

      // Notify other screens via WebSocket
      wsManager.send(WSEventType.COIN_BALANCE_UPDATE, {
        newBalance: authBalance,
        changeAmount: authBalance - (coinBalance || 0),
        timestamp: new Date().toISOString(),
        reason: getActionReason(action.type),
      });
    }
  }

  return result;
};

// Helper function to get human-readable reason for balance change
function getActionReason(actionType: string): string {
  const reasonMap: Record<string, string> = {
    'coin/earnCoins/fulfilled': 'Donation reward',
    'coin/spendCoins/fulfilled': 'Purchase',
    'coin/purchaseCoins/fulfilled': 'Coin purchase',
    'battlePass/claimBattlePassReward/fulfilled': 'Battle pass reward',
    'gamification/completeMission/fulfilled': 'Mission completion',
    'crew/distributeCrewRewards/fulfilled': 'Crew reward',
    'userLevels/unlockLevelPerk/fulfilled': 'Level perk unlock',
  };

  return reasonMap[actionType] || 'Balance update';
}

// WebSocket listener for coin balance updates from other clients
export const setupCoinBalanceWebSocketListener = (dispatch: AppDispatch) => {
  const subscriptionId = wsManager.subscribe(WSEventType.COIN_BALANCE_UPDATE, (data) => {
    // Only update if the balance is different (avoid echo updates)
    const currentBalance = dispatch((_, getState) => getState().auth.user?.charityCoins);

    if (currentBalance !== data.newBalance) {
      dispatch(updateCoinBalance({
        balance: data.newBalance,
        lastUpdated: data.timestamp,
      }));
    }
  });

  return subscriptionId;
};

// Offline queue for coin balance updates when offline
class CoinBalanceQueue {
  private queue: Array<{
    balance: number;
    timestamp: string;
    reason: string;
  }> = [];
  private isOnline = true;

  enqueue(balance: number, reason: string) {
    this.queue.push({
      balance,
      timestamp: new Date().toISOString(),
      reason,
    });
  }

  dequeue(): Array<{ balance: number; timestamp: string; reason: string }> {
    return this.queue.splice(0);
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  setOnlineStatus(online: boolean) {
    this.isOnline = online;
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }
}

export const coinBalanceQueue = new CoinBalanceQueue();

// Enhanced middleware with offline support
export const enhancedCoinSyncMiddleware: Middleware<
  {},
  RootState,
  AppDispatch
> = (store) => (next) => (action) => {
  const result = next(action);

  if (COIN_AFFECTING_ACTIONS.includes(action.type)) {
    const state = store.getState();
    const authBalance = state.auth.user?.charityCoins;
    const coinBalance = state.coin.balance;

    if (authBalance !== undefined && authBalance !== coinBalance) {
      // Update local state
      store.dispatch(updateCoinBalance({
        balance: authBalance,
        lastUpdated: new Date().toISOString(),
      }));

      // Queue for sync when online
      if (!coinBalanceQueue.isOnlineStatus()) {
        coinBalanceQueue.enqueue(
          authBalance,
          getActionReason(action.type)
        );
      } else {
        // Send WebSocket update
        wsManager.send(WSEventType.COIN_BALANCE_UPDATE, {
          newBalance: authBalance,
          changeAmount: authBalance - (coinBalance || 0),
          timestamp: new Date().toISOString(),
          reason: getActionReason(action.type),
        });
      }
    }
  }

  return result;
};