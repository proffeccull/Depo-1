import coinReducer, {
  updateBalance,
  addTransaction,
  updateStreak,
  updateMilestone,
  updateAchievement,
  updateBattlePassProgress,
  clearError,
  resetCoinState,
} from '../slices/coinSlice';

describe('coinSlice', () => {
  const initialState = {
    balance: {
      current: 0,
      trend: 'stable' as const,
      change24h: 0,
      lastUpdated: new Date().toISOString(),
    },
    transactions: [],
    milestones: [],
    streak: {
      current: 0,
      longest: 0,
      lastActivity: new Date().toISOString(),
      freezeCount: 0,
      nextMilestone: 7,
    },
    achievements: [],
    battlePass: null,
    marketplace: [],
    leaderboard: [],
    analytics: {},
    loading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(coinReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should update balance', () => {
    const newBalance = {
      current: 1000,
      trend: 'up' as const,
      change24h: 100,
      lastUpdated: new Date().toISOString(),
    };

    const action = updateBalance(newBalance);
    const result = coinReducer(initialState, action);

    expect(result.balance).toEqual(newBalance);
  });

  it('should add transaction', () => {
    const transaction = {
      id: 'tx-1',
      type: 'earned' as const,
      amount: 500,
      description: 'Donation reward',
      timestamp: new Date().toISOString(),
      category: 'donation',
    };

    const action = addTransaction(transaction);
    const result = coinReducer(initialState, action);

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toEqual(transaction);
  });

  it('should limit transactions to 100', () => {
    const transactions = Array.from({ length: 101 }, (_, i) => ({
      id: `tx-${i}`,
      type: 'earned' as const,
      amount: 100,
      description: `Transaction ${i}`,
      timestamp: new Date().toISOString(),
    }));

    let state = initialState;
    transactions.forEach(tx => {
      state = coinReducer(state, addTransaction(tx));
    });

    expect(state.transactions).toHaveLength(100);
  });

  it('should update streak', () => {
    const newStreak = {
      current: 5,
      longest: 10,
      lastActivity: new Date().toISOString(),
      freezeCount: 2,
      nextMilestone: 14,
    };

    const action = updateStreak(newStreak);
    const result = coinReducer(initialState, action);

    expect(result.streak).toEqual(newStreak);
  });

  it('should update milestone progress', () => {
    const initialStateWithMilestone = {
      ...initialState,
      milestones: [{
        id: 'milestone-1',
        name: 'First 1000 coins',
        target: 1000,
        current: 500,
        reward: 100,
        unlocked: false,
      }],
    };

    const action = updateMilestone({ id: 'milestone-1', progress: 1000 });
    const result = coinReducer(initialStateWithMilestone, action);

    expect(result.milestones[0].current).toBe(1000);
    expect(result.milestones[0].unlocked).toBe(true);
    expect(result.milestones[0].unlockedAt).toBeDefined();
    expect(result.balance.current).toBe(100); // Reward added
  });

  it('should update achievement progress', () => {
    const initialStateWithAchievement = {
      ...initialState,
      achievements: [{
        id: 'achievement-1',
        name: 'Generous Heart',
        description: 'Donate to 10 causes',
        icon: 'favorite',
        rarity: 'common' as const,
        coinReward: 500,
        unlocked: false,
        progress: 5,
        target: 10,
      }],
    };

    const action = updateAchievement({ id: 'achievement-1', progress: 10, unlocked: true });
    const result = coinReducer(initialStateWithAchievement, action);

    expect(result.achievements[0].progress).toBe(10);
    expect(result.achievements[0].unlocked).toBe(true);
    expect(result.achievements[0].unlockedAt).toBeDefined();
    expect(result.balance.current).toBe(500); // Reward added
  });

  it('should update battle pass progress', () => {
    const initialStateWithBattlePass = {
      ...initialState,
      battlePass: {
        id: 'bp-1',
        name: 'Season 1',
        season: 1,
        cost: 1000,
        purchased: true,
        currentTier: 5,
        maxTier: 50,
        xpCurrent: 2500,
        xpRequired: 100,
        freeRewards: [],
        premiumRewards: [],
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    };

    const action = updateBattlePassProgress({ xpGained: 150 });
    const result = coinReducer(initialStateWithBattlePass, action);

    expect(result.battlePass!.xpCurrent).toBe(2650);
    expect(result.battlePass!.currentTier).toBe(6); // Advanced to next tier
  });

  it('should clear error', () => {
    const stateWithError = {
      ...initialState,
      error: 'Test error',
    };

    const action = clearError();
    const result = coinReducer(stateWithError, action);

    expect(result.error).toBeNull();
  });

  it('should reset coin state', () => {
    const modifiedState = {
      ...initialState,
      balance: { ...initialState.balance, current: 1000 },
      transactions: [{ id: 'tx-1', type: 'earned' as const, amount: 100, description: 'Test', timestamp: new Date().toISOString() }],
    };

    const action = resetCoinState();
    const result = coinReducer(modifiedState, action);

    expect(result).toEqual(initialState);
  });
});