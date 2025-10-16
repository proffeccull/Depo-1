export const BattlePassApi = {
  async getBattlePass(userId: string) {
    return {
      id: 'demo',
      userId,
      currentTier: 1,
      totalTiers: 10,
      currentProgress: 10,
      totalProgress: 100,
      hasPremium: false,
      premiumCost: 1000,
      tiers: [],
      seasonStart: new Date().toISOString(),
      seasonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  async purchasePremium(userId: string, tier: 'premium') {
    return { tiers: [] } as any;
  },
  async claimReward(userId: string, tierIndex: number) {
    return { success: true } as any;
  },
  async updateProgress(userId: string, progress: number) {
    return { currentProgress: progress, currentTier: Math.floor(progress / 10) } as any;
  },
};

