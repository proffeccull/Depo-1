import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';

// Import coin actions
import {
  fetchCoinBalance,
  fetchCoinTransactions,
  earnCoins,
  spendCoins,
  purchaseCoins,
  fetchAchievements,
  unlockAchievement,
  fetchBattlePass,
  purchaseBattlePass,
  fetchCoinAnalytics,
  updateBalance,
  addTransaction,
  updateStreak,
  updateMilestone,
  updateAchievement,
  updateBattlePassProgress,
} from '../store/slices/coinSlice';

// Import analytics actions
import {
  fetchUserAnalytics,
  fetchCoinAnalytics as fetchAnalyticsCoin,
  trackEvent,
  trackCoinTransaction,
  trackAchievementUnlock,
} from '../store/slices/analyticsSlice';

// Import API service
import coinApiService, { coinWebSocket } from '../services/coinApi';

// Import sound effects
import { coinSounds } from '../components/coins';

// Types
interface UseCoinSystemOptions {
  autoFetch?: boolean;
  enableWebSocket?: boolean;
  enableAnalytics?: boolean;
}

interface CoinSystemHook {
  // State
  balance: any;
  transactions: any[];
  achievements: any[];
  battlePass: any;
  analytics: any;
  loading: boolean;
  error: string | null;

  // Actions
  refreshBalance: () => Promise<void>;
  earnCoinsAction: (amount: number, source: string, description: string) => Promise<void>;
  spendCoinsAction: (amount: number, category: string, description: string) => Promise<void>;
  purchaseCoinsAction: (agentId: string, quantity: number) => Promise<void>;
  unlockAchievementAction: (achievementId: string) => Promise<void>;
  purchaseBattlePassAction: (seasonId: string) => Promise<void>;
  trackUserEvent: (eventType: string, eventData: any) => Promise<void>;

  // Utilities
  formatCoinAmount: (amount: number) => string;
  calculateTrend: (current: number, previous: number) => 'up' | 'down' | 'stable';
  getAchievementProgress: (achievementId: string) => number;
  getMilestoneProgress: (milestoneId: string) => number;
}

export const useCoinSystem = (
  userId: string | null,
  options: UseCoinSystemOptions = {}
): CoinSystemHook => {
  const {
    autoFetch = true,
    enableWebSocket = true,
    enableAnalytics = true,
  } = options;

  const dispatch = useDispatch<AppDispatch>();

  // Select state
  const {
    balance,
    transactions,
    achievements,
    battlePass,
    loading,
    error,
  } = useSelector((state: RootState) => state.coin);

  const { analytics } = useSelector((state: RootState) => state.analytics);

  // Auto-fetch data on mount
  useEffect(() => {
    if (userId && autoFetch) {
      refreshBalance();
      fetchInitialData();
    }
  }, [userId, autoFetch]);

  // WebSocket connection
  useEffect(() => {
    if (userId && enableWebSocket) {
      const handleWebSocketMessage = (data: any) => {
        switch (data.type) {
          case 'balance_update':
            dispatch(updateBalance(data.balance));
            break;
          case 'transaction':
            dispatch(addTransaction(data.transaction));
            break;
          case 'achievement_unlocked':
            dispatch(updateAchievement({
              id: data.achievementId,
              unlocked: true,
              progress: data.progress,
            }));
            break;
          case 'streak_update':
            dispatch(updateStreak(data.streak));
            break;
          case 'milestone_progress':
            dispatch(updateMilestone({
              id: data.milestoneId,
              progress: data.progress,
            }));
            break;
          case 'battle_pass_progress':
            dispatch(updateBattlePassProgress({
              xpGained: data.xpGained,
            }));
            break;
        }
      };

      coinWebSocket.connect(userId, handleWebSocketMessage);

      return () => {
        coinWebSocket.disconnect();
      };
    }
  }, [userId, enableWebSocket]);

  // Actions
  const refreshBalance = useCallback(async () => {
    if (!userId) return;
    try {
      await dispatch(fetchCoinBalance(userId)).unwrap();
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [userId, dispatch]);

  const fetchInitialData = useCallback(async () => {
    if (!userId) return;

    try {
      await Promise.all([
        dispatch(fetchCoinTransactions({ userId, limit: 20 })).unwrap(),
        dispatch(fetchAchievements(userId)).unwrap(),
        dispatch(fetchBattlePass(userId)).unwrap(),
        enableAnalytics && dispatch(fetchUserAnalytics({ userId, timeframe: 'month' })).unwrap(),
        enableAnalytics && dispatch(fetchAnalyticsCoin({ userId, timeframe: 'month' })).unwrap(),
      ]);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  }, [userId, dispatch, enableAnalytics]);

  const earnCoinsAction = useCallback(async (
    amount: number,
    source: string,
    description: string
  ) => {
    if (!userId) return;

    try {
      // Play sound effect
      coinSounds.playCoinEarn();

      // Dispatch action
      const result = await dispatch(earnCoins({
        userId,
        amount,
        source,
        description,
      })).unwrap();

      // Track analytics
      if (enableAnalytics) {
        await dispatch(trackCoinTransaction({
          userId,
          transaction: result.transaction,
        })).unwrap();
      }

      // Show celebration
      // This would trigger particle effects and animations

    } catch (error) {
      console.error('Failed to earn coins:', error);
      throw error;
    }
  }, [userId, dispatch, enableAnalytics]);

  const spendCoinsAction = useCallback(async (
    amount: number,
    category: string,
    description: string
  ) => {
    if (!userId) return;

    try {
      // Play sound effect
      coinSounds.playCoinSpend();

      // Dispatch action
      const result = await dispatch(spendCoins({
        userId,
        amount,
        category,
        description,
      })).unwrap();

      // Track analytics
      if (enableAnalytics) {
        await dispatch(trackCoinTransaction({
          userId,
          transaction: result.transaction,
        })).unwrap();
      }

    } catch (error) {
      console.error('Failed to spend coins:', error);
      throw error;
    }
  }, [userId, dispatch, enableAnalytics]);

  const purchaseCoinsAction = useCallback(async (
    agentId: string,
    quantity: number
  ) => {
    if (!userId) return;

    try {
      // Play sound effect
      coinSounds.playCoinPurchase();

      // Dispatch action
      await dispatch(purchaseCoins({
        userId,
        agentId,
        quantity,
      })).unwrap();

      // Track analytics
      if (enableAnalytics) {
        await dispatch(trackEvent({
          userId,
          eventType: 'coin_purchase',
          eventData: { agentId, quantity },
        })).unwrap();
      }

    } catch (error) {
      console.error('Failed to purchase coins:', error);
      throw error;
    }
  }, [userId, dispatch, enableAnalytics]);

  const unlockAchievementAction = useCallback(async (achievementId: string) => {
    if (!userId) return;

    try {
      // Play sound effect
      coinSounds.playAchievementUnlock();

      // Dispatch action
      const result = await dispatch(unlockAchievement({
        userId,
        achievementId,
      })).unwrap();

      // Track analytics
      if (enableAnalytics) {
        await dispatch(trackAchievementUnlock({
          userId,
          achievementId,
          rarity: result.achievement.rarity,
        })).unwrap();
      }

      // Show celebration modal
      // This would trigger achievement celebration

    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      throw error;
    }
  }, [userId, dispatch, enableAnalytics]);

  const purchaseBattlePassAction = useCallback(async (seasonId: string) => {
    if (!userId) return;

    try {
      await dispatch(purchaseBattlePass({
        userId,
        seasonId,
      })).unwrap();

      // Track analytics
      if (enableAnalytics) {
        await dispatch(trackEvent({
          userId,
          eventType: 'battle_pass_purchase',
          eventData: { seasonId },
        })).unwrap();
      }

    } catch (error) {
      console.error('Failed to purchase battle pass:', error);
      throw error;
    }
  }, [userId, dispatch, enableAnalytics]);

  const trackUserEvent = useCallback(async (
    eventType: string,
    eventData: any
  ) => {
    if (!userId || !enableAnalytics) return;

    try {
      await dispatch(trackEvent({
        userId,
        eventType,
        eventData,
      })).unwrap();
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [userId, dispatch, enableAnalytics]);

  // Utility functions
  const formatCoinAmount = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const calculateTrend = useCallback((
    current: number,
    previous: number
  ): 'up' | 'down' | 'stable' => {
    const change = ((current - previous) / previous) * 100;
    if (change > 1) return 'up';
    if (change < -1) return 'down';
    return 'stable';
  }, []);

  const getAchievementProgress = useCallback((achievementId: string): number => {
    const achievement = achievements.find((a: any) => a.id === achievementId);
    return achievement?.progress || 0;
  }, [achievements]);

  const getMilestoneProgress = useCallback((milestoneId: string): number => {
    // This would need to be implemented based on milestone structure
    return 0;
  }, []);

  return {
    // State
    balance,
    transactions,
    achievements,
    battlePass,
    analytics,
    loading,
    error,

    // Actions
    refreshBalance,
    earnCoinsAction,
    spendCoinsAction,
    purchaseCoinsAction,
    unlockAchievementAction,
    purchaseBattlePassAction,
    trackUserEvent,

    // Utilities
    formatCoinAmount,
    calculateTrend,
    getAchievementProgress,
    getMilestoneProgress,
  };
};

// Specialized hooks for specific use cases
export const useCoinBalance = (userId: string | null) => {
  const { balance, refreshBalance, loading } = useCoinSystem(userId, {
    autoFetch: true,
    enableWebSocket: true,
  });

  return { balance, refreshBalance, loading };
};

export const useCoinTransactions = (userId: string | null) => {
  const { transactions, loading } = useCoinSystem(userId, {
    autoFetch: true,
  });

  return { transactions, loading };
};

export const useCoinAchievements = (userId: string | null) => {
  const { achievements, unlockAchievementAction, loading } = useCoinSystem(userId, {
    autoFetch: true,
  });

  return { achievements, unlockAchievementAction, loading };
};

export const useCoinAnalytics = (userId: string | null) => {
  const { analytics, trackUserEvent, loading } = useCoinSystem(userId, {
    autoFetch: true,
    enableAnalytics: true,
  });

  return { analytics, trackUserEvent, loading };
};

export default useCoinSystem;