import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import {
  wsManager,
  WSEventType,
  subscribeToCrewUpdates,
  subscribeToLeaderboardUpdates,
  subscribeToMissionUpdates,
  subscribeToCoinBalanceUpdates,
  subscribeToNotifications,
  useWebSocketCleanup,
} from '../services/websocket';

// Redux actions for WebSocket updates
import {
  updateCrew,
  addCrewDonation,
  updateCrewChallenge,
} from '../store/slices/crewSlice';

import {
  updateBattlePassProgress,
  updateBattlePassTier,
} from '../store/slices/battlePassSlice';

import {
  earnCoins,
} from '../store/slices/coinSlice';

import {
  awardXP,
  checkLevelUp,
} from '../store/slices/userLevelsSlice';

import {
  fetchNotifications,
} from '../store/slices/notificationSlice';

// Hook for crew WebSocket updates
export const useCrewWebSocket = (crewId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (crewId) {
      subscriptionRef.current = subscribeToCrewUpdates(crewId, (data) => {
        switch (data.updateType) {
          case 'progress':
            dispatch(updateCrew({
              id: crewId,
              currentProgress: data.currentProgress,
              lastUpdated: data.timestamp,
            }));
            break;
          case 'donation':
            dispatch(addCrewDonation(data.donation));
            break;
          case 'challenge':
            dispatch(updateCrewChallenge(data.challenge));
            break;
          case 'member_join':
          case 'member_leave':
            // Refetch crew data to get updated member list
            dispatch(fetchCrews());
            break;
        }
      });
    }

    return () => {
      if (subscriptionRef.current) {
        wsManager.unsubscribe(subscriptionRef.current);
      }
    };
  }, [crewId, dispatch]);

  return subscriptionRef.current;
};

// Hook for leaderboard WebSocket updates
export const useLeaderboardWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    subscriptionRef.current = subscribeToLeaderboardUpdates((data) => {
      // Update leaderboard data in relevant slices
      switch (data.leaderboardType) {
        case 'global':
          dispatch(updateGlobalLeaderboard(data.entries));
          break;
        case 'weekly':
          dispatch(updateWeeklyLeaderboard(data.entries));
          break;
        case 'crew':
          dispatch(updateCrewLeaderboard(data.entries));
          break;
      }
    });

    return () => {
      if (subscriptionRef.current) {
        wsManager.unsubscribe(subscriptionRef.current);
      }
    };
  }, [dispatch]);

  return subscriptionRef.current;
};

// Hook for mission WebSocket updates
export const useMissionWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    subscriptionRef.current = subscribeToMissionUpdates((data) => {
      // Update mission progress
      dispatch(updateMissionProgress({
        missionId: data.missionId,
        progress: data.progress,
        completed: data.completed,
      }));

      if (data.completed && data.reward) {
        // Award coins for completed mission
        dispatch(earnCoins({
          userId: data.userId,
          amount: data.reward.coins,
          source: 'mission',
          description: `Completed mission: ${data.missionTitle}`,
        }));
      }
    });

    return () => {
      if (subscriptionRef.current) {
        wsManager.unsubscribe(subscriptionRef.current);
      }
    };
  }, [dispatch]);

  return subscriptionRef.current;
};

// Hook for coin balance WebSocket updates
export const useCoinBalanceWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    subscriptionRef.current = subscribeToCoinBalanceUpdates((data) => {
      // Update coin balance across all relevant screens
      dispatch(updateCoinBalance({
        balance: data.newBalance,
        lastUpdated: data.timestamp,
      }));

      // Show notification for coin changes
      if (data.changeAmount !== 0) {
        const changeType = data.changeAmount > 0 ? 'earned' : 'spent';
        const message = `${Math.abs(data.changeAmount)} coins ${changeType}: ${data.reason}`;

        // Add to notification system
        dispatch(addNotification({
          id: `coin_${Date.now()}`,
          type: 'coin_update',
          title: 'Coin Balance Updated',
          message,
          timestamp: data.timestamp,
          read: false,
        }));
      }
    });

    return () => {
      if (subscriptionRef.current) {
        wsManager.unsubscribe(subscriptionRef.current);
      }
    };
  }, [dispatch]);

  return subscriptionRef.current;
};

// Hook for battle pass WebSocket updates
export const useBattlePassWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    subscriptionRef.current = wsManager.subscribe(WSEventType.ACHIEVEMENT_UNLOCK, (data) => {
      if (data.type === 'battle_pass') {
        dispatch(updateBattlePassProgress({
          progress: data.newProgress,
        }));

        if (data.tierUnlocked) {
          dispatch(updateBattlePassTier({
            tierIndex: data.tierIndex,
            unlocked: true,
          }));
        }
      }
    });

    return () => {
      if (subscriptionRef.current) {
        wsManager.unsubscribe(subscriptionRef.current);
      }
    };
  }, [dispatch]);

  return subscriptionRef.current;
};

// Hook for level progression WebSocket updates
export const useLevelWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    subscriptionRef.current = wsManager.subscribe(WSEventType.LEVEL_UP, (data) => {
      // Award XP and check for level up
      dispatch(awardXP({
        userId: data.userId,
        amount: data.xpGained,
        reason: data.reason,
        category: data.category,
      }));

      dispatch(checkLevelUp(data.userId));
    });

    return () => {
      if (subscriptionRef.current) {
        wsManager.unsubscribe(subscriptionRef.current);
      }
    };
  }, [dispatch]);

  return subscriptionRef.current;
};

// Hook for notifications WebSocket updates
export const useNotificationWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    subscriptionRef.current = subscribeToNotifications((data) => {
      dispatch(addNotification(data));
    });

    return () => {
      if (subscriptionRef.current) {
        wsManager.unsubscribe(subscriptionRef.current);
      }
    };
  }, [dispatch]);

  return subscriptionRef.current;
};

// Combined hook for all gamification WebSocket updates
export const useGamificationWebSocket = (options: {
  crewId?: string;
  enableLeaderboard?: boolean;
  enableMissions?: boolean;
  enableCoins?: boolean;
  enableBattlePass?: boolean;
  enableLevels?: boolean;
  enableNotifications?: boolean;
} = {}) => {
  const subscriptionsRef = useRef<string[]>([]);

  // Crew updates
  const crewSubscription = useCrewWebSocket(options.crewId || '');

  // Leaderboard updates
  const leaderboardSubscription = options.enableLeaderboard
    ? useLeaderboardWebSocket()
    : null;

  // Mission updates
  const missionSubscription = options.enableMissions
    ? useMissionWebSocket()
    : null;

  // Coin balance updates
  const coinSubscription = options.enableCoins
    ? useCoinBalanceWebSocket()
    : null;

  // Battle pass updates
  const battlePassSubscription = options.enableBattlePass
    ? useBattlePassWebSocket()
    : null;

  // Level updates
  const levelSubscription = options.enableLevels
    ? useLevelWebSocket()
    : null;

  // Notification updates
  const notificationSubscription = options.enableNotifications
    ? useNotificationWebSocket()
    : null;

  useEffect(() => {
    const subs = [
      crewSubscription,
      leaderboardSubscription,
      missionSubscription,
      coinSubscription,
      battlePassSubscription,
      levelSubscription,
      notificationSubscription,
    ].filter(Boolean) as string[];

    subscriptionsRef.current = subs;

    return () => {
      subs.forEach(sub => wsManager.unsubscribe(sub));
    };
  }, [
    crewSubscription,
    leaderboardSubscription,
    missionSubscription,
    coinSubscription,
    battlePassSubscription,
    levelSubscription,
    notificationSubscription,
  ]);

  return subscriptionsRef.current;
};

// Utility hook for WebSocket connection status
export const useWebSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(wsManager.isWebSocketConnected());
  const connectionSubscriptionRef = useRef<string | null>(null);
  const disconnectSubscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    connectionSubscriptionRef.current = wsManager.subscribe(WSEventType.CONNECT, () => {
      setIsConnected(true);
    });

    disconnectSubscriptionRef.current = wsManager.subscribe(WSEventType.DISCONNECT, () => {
      setIsConnected(false);
    });

    return () => {
      if (connectionSubscriptionRef.current) {
        wsManager.unsubscribe(connectionSubscriptionRef.current);
      }
      if (disconnectSubscriptionRef.current) {
        wsManager.unsubscribe(disconnectSubscriptionRef.current);
      }
    };
  }, []);

  return isConnected;
};