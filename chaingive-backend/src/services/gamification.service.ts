import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Gamification Service
 * Handles all gamification logic: missions, streaks, achievements, challenges
 */

// ============================================
// DAILY MISSIONS
// ============================================

const MISSION_TYPES = {
  DONATE: 'donate',
  BUY_COINS: 'buy_coins',
  REFER: 'refer',
  LEADERBOARD: 'leaderboard',
  MARKETPLACE: 'marketplace',
  PROFILE_UPDATE: 'profile_update',
  KYC_SUBMIT: 'kyc_submit',
};

const MISSION_REWARDS = {
  [MISSION_TYPES.DONATE]: 50,
  [MISSION_TYPES.BUY_COINS]: 30,
  [MISSION_TYPES.REFER]: 20,
  [MISSION_TYPES.LEADERBOARD]: 15,
  [MISSION_TYPES.MARKETPLACE]: 25,
  [MISSION_TYPES.PROFILE_UPDATE]: 10,
  [MISSION_TYPES.KYC_SUBMIT]: 100,
};

const DAILY_MISSION_SETS = [
  [MISSION_TYPES.DONATE, MISSION_TYPES.BUY_COINS, MISSION_TYPES.REFER],
  [MISSION_TYPES.DONATE, MISSION_TYPES.MARKETPLACE, MISSION_TYPES.LEADERBOARD],
  [MISSION_TYPES.BUY_COINS, MISSION_TYPES.REFER, MISSION_TYPES.LEADERBOARD],
  [MISSION_TYPES.DONATE, MISSION_TYPES.BUY_COINS, MISSION_TYPES.MARKETPLACE],
  [MISSION_TYPES.MARKETPLACE, MISSION_TYPES.REFER, MISSION_TYPES.LEADERBOARD],
  // Weekend special
  [MISSION_TYPES.DONATE, MISSION_TYPES.BUY_COINS, MISSION_TYPES.REFER], // Saturday
  [MISSION_TYPES.DONATE, MISSION_TYPES.BUY_COINS, MISSION_TYPES.REFER], // Sunday (higher rewards)
];

/**
 * Get or create today's missions for a user
 */
export async function getTodaysMissions(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let missions = await prisma.dailyMission.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  if (!missions) {
    missions = await createDailyMissions(userId, today);
  }

  return missions;
}

/**
 * Create daily missions for a user
 */
async function createDailyMissions(userId: string, date: Date) {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const missionSet = DAILY_MISSION_SETS[dayOfWeek];

  // Weekend bonus (Saturday & Sunday get higher rewards)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const multiplier = isWeekend ? 1.5 : 1;

  const missions = await prisma.dailyMission.create({
    data: {
      userId,
      date,
      mission1Type: missionSet[0],
      mission1Reward: Math.floor(MISSION_REWARDS[missionSet[0]] * multiplier),
      mission2Type: missionSet[1],
      mission2Reward: Math.floor(MISSION_REWARDS[missionSet[1]] * multiplier),
      mission3Type: missionSet[2],
      mission3Reward: Math.floor(MISSION_REWARDS[missionSet[2]] * multiplier),
      bonusReward: isWeekend ? 75 : 50,
    },
  });

  logger.info(`Created daily missions for user ${userId}`, { missions });
  return missions;
}

/**
 * Mark a mission as complete and award coins
 */
export async function completeMission(
  userId: string,
  missionType: string
): Promise<{ success: boolean; coinsAwarded: number; allComplete: boolean }> {
  const missions = await getTodaysMissions(userId);

  let coinsAwarded = 0;
  let fieldToUpdate: string | null = null;
  let rewardField: string | null = null;

  // Determine which mission to complete
  if (missions.mission1Type === missionType && !missions.mission1Done) {
    fieldToUpdate = 'mission1Done';
    rewardField = 'mission1Reward';
    coinsAwarded = missions.mission1Reward;
  } else if (missions.mission2Type === missionType && !missions.mission2Done) {
    fieldToUpdate = 'mission2Done';
    rewardField = 'mission2Reward';
    coinsAwarded = missions.mission2Reward;
  } else if (missions.mission3Type === missionType && !missions.mission3Done) {
    fieldToUpdate = 'mission3Done';
    rewardField = 'mission3Reward';
    coinsAwarded = missions.mission3Reward;
  }

  if (!fieldToUpdate) {
    return { success: false, coinsAwarded: 0, allComplete: false };
  }

  // Update mission and check if all complete
  const updated = await prisma.dailyMission.update({
    where: { id: missions.id },
    data: {
      [fieldToUpdate]: true,
    },
  });

  const allComplete = updated.mission1Done && updated.mission2Done && updated.mission3Done;

  // If all complete, award bonus
  if (allComplete && !updated.allCompleted) {
    coinsAwarded += updated.bonusReward;

    await prisma.$transaction([
      // Mark as all complete
      prisma.dailyMission.update({
        where: { id: missions.id },
        data: {
          allCompleted: true,
          totalCoinsEarned: updated.mission1Reward + updated.mission2Reward + updated.mission3Reward + updated.bonusReward,
          completedAt: new Date(),
        },
      }),
      // Award coins to user
      prisma.user.update({
        where: { id: userId },
        data: {
          charityCoinsBalance: {
            increment: coinsAwarded,
          },
        },
      }),
      // Update gamification stats
      prisma.gamificationStats.upsert({
        where: { userId },
        create: {
          userId,
          totalCoinsEarned: coinsAwarded,
          totalMissionsCompleted: 3,
          weeklyMissionsCompleted: 3,
        },
        update: {
          totalCoinsEarned: { increment: coinsAwarded },
          totalMissionsCompleted: { increment: 3 },
          weeklyMissionsCompleted: { increment: 3 },
        },
      }),
    ]);
  } else {
    // Award coins for single mission
    await prisma.user.update({
      where: { id: userId },
      data: {
        charityCoinsBalance: {
          increment: coinsAwarded,
        },
      },
    });
  }

  logger.info(`Mission completed for user ${userId}`, { missionType, coinsAwarded, allComplete });

  return { success: true, coinsAwarded, allComplete };
}

// ============================================
// DAILY STREAK
// ============================================

const STREAK_REWARDS = {
  1: 10,
  2: 15,
  3: 20,
  4: 25,
  5: 30,
  6: 40,
  7: 50, // Week bonus
  14: 100, // 2 weeks
  30: 250, // Month
  60: 500,
  90: 1000,
  180: 2500,
  365: 5000, // Year!
};

/**
 * Update user's streak on login
 */
export async function updateStreak(userId: string): Promise<{ coins: number; currentStreak: number; isNew: boolean }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.dailyStreak.findUnique({
    where: { userId },
  });

  if (!streak) {
    // First login ever
    const newStreak = await prisma.dailyStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: today,
        totalCoinsEarned: STREAK_REWARDS[1],
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        charityCoinsBalance: { increment: STREAK_REWARDS[1] },
      },
    });

    return { coins: STREAK_REWARDS[1], currentStreak: 1, isNew: true };
  }

  const lastLogin = new Date(streak.lastLoginDate || 0);
  lastLogin.setHours(0, 0, 0, 0);

  const daysSinceLastLogin = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = streak.currentStreak;
  let coinsToAward = 0;

  if (daysSinceLastLogin === 0) {
    // Already logged in today
    return { coins: 0, currentStreak: streak.currentStreak, isNew: false };
  } else if (daysSinceLastLogin === 1) {
    // Consecutive day - continue streak
    newStreak = streak.currentStreak + 1;
    coinsToAward = STREAK_REWARDS[newStreak] || STREAK_REWARDS[7] + (newStreak - 7) * 5; // After day 7, +5 coins per day
  } else {
    // Broke streak - reset to 1
    newStreak = 1;
    coinsToAward = STREAK_REWARDS[1];
  }

  const longestStreak = Math.max(streak.longestStreak, newStreak);

  await prisma.$transaction([
    prisma.dailyStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastLoginDate: today,
        totalCoinsEarned: { increment: coinsToAward },
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        charityCoinsBalance: { increment: coinsToAward },
      },
    }),
  ]);

  logger.info(`Streak updated for user ${userId}`, { newStreak, coinsToAward });

  return { coins: coinsToAward, currentStreak: newStreak, isNew: false };
}

// ============================================
// PROGRESS RINGS
// ============================================

/**
 * Get or create today's progress rings
 */
export async function getTodaysProgress(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let progress = await prisma.dailyProgress.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  if (!progress) {
    progress = await prisma.dailyProgress.create({
      data: {
        userId,
        date: today,
      },
    });
  }

  return progress;
}

/**
 * Update a specific ring's progress
 */
export async function updateRingProgress(
  userId: string,
  ringType: 'give' | 'earn' | 'engage',
  incrementBy: number = 1
): Promise<{ ringClosed: boolean; allRingsClosed: boolean; coinsAwarded: number }> {
  const progress = await getTodaysProgress(userId);

  const updateData: any = {};
  let ringClosed = false;
  let coinsAwarded = 0;

  if (ringType === 'give') {
    const newProgress = Math.min(progress.giveProgress + incrementBy, progress.giveGoal);
    updateData.giveProgress = newProgress;
    if (newProgress >= progress.giveGoal && !progress.giveClosed) {
      updateData.giveClosed = true;
      ringClosed = true;
    }
  } else if (ringType === 'earn') {
    const newProgress = Math.min(progress.earnProgress + incrementBy, progress.earnGoal);
    updateData.earnProgress = newProgress;
    if (newProgress >= progress.earnGoal && !progress.earnClosed) {
      updateData.earnClosed = true;
      ringClosed = true;
    }
  } else if (ringType === 'engage') {
    const newProgress = Math.min(progress.engageProgress + incrementBy, progress.engageGoal);
    updateData.engageProgress = newProgress;
    if (newProgress >= progress.engageGoal && !progress.engageClosed) {
      updateData.engageClosed = true;
      ringClosed = true;
    }
  }

  const updated = await prisma.dailyProgress.update({
    where: { id: progress.id },
    data: updateData,
  });

  const allRingsClosed = updated.giveClosed && updated.earnClosed && updated.engageClosed;

  // Award perfect day bonus
  if (allRingsClosed && !updated.allRingsClosed && !updated.bonusAwarded) {
    coinsAwarded = updated.bonusAmount;

    await prisma.$transaction([
      prisma.dailyProgress.update({
        where: { id: progress.id },
        data: {
          allRingsClosed: true,
          bonusAwarded: true,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          charityCoinsBalance: { increment: coinsAwarded },
        },
      }),
      prisma.gamificationStats.upsert({
        where: { userId },
        create: {
          userId,
          totalCoinsEarned: coinsAwarded,
          totalPerfectDays: 1,
          weeklyPerfectDays: 1,
        },
        update: {
          totalCoinsEarned: { increment: coinsAwarded },
          totalPerfectDays: { increment: 1 },
          weeklyPerfectDays: { increment: 1 },
        },
      }),
    ]);
  }

  logger.info(`Ring progress updated for user ${userId}`, { ringType, ringClosed, allRingsClosed, coinsAwarded });

  return { ringClosed, allRingsClosed, coinsAwarded };
}

// ============================================
// WEEKLY CHALLENGES
// ============================================

/**
 * Get active weekly challenges
 */
export async function getActiveWeeklyChallenges() {
  const now = new Date();

  return await prisma.weeklyChallenge.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });
}

/**
 * Get user's progress on weekly challenges
 */
export async function getUserWeeklyChallengeProgress(userId: string) {
  const challenges = await getActiveWeeklyChallenges();

  return await prisma.weeklyChallengeProgress.findMany({
    where: {
      userId,
      challengeId: { in: challenges.map(c => c.id) },
    },
    include: {
      challenge: true,
    },
  });
}

/**
 * Update weekly challenge progress
 */
export async function updateWeeklyChallengeProgress(
  userId: string,
  challengeType: string,
  incrementBy: number = 1
) {
  const challenges = await getActiveWeeklyChallenges();
  const relevantChallenge = challenges.find(c => c.type === challengeType);

  if (!relevantChallenge) return;

  const existing = await prisma.weeklyChallengeProgress.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId: relevantChallenge.id,
      },
    },
  });

  if (existing) {
    const newValue = existing.currentValue + incrementBy;
    const completed = newValue >= existing.targetValue;

    await prisma.weeklyChallengeProgress.update({
      where: { id: existing.id },
      data: {
        currentValue: newValue,
        percentage: Math.min(100, Math.floor((newValue / existing.targetValue) * 100)),
        completed,
        completedAt: completed ? new Date() : undefined,
      },
    });
  } else {
    await prisma.weeklyChallengeProgress.create({
      data: {
        userId,
        challengeId: relevantChallenge.id,
        targetValue: relevantChallenge.targetValue,
        currentValue: incrementBy,
        percentage: Math.floor((incrementBy / relevantChallenge.targetValue) * 100),
      },
    });
  }
}

// ============================================
// ACHIEVEMENTS
// ============================================

/**
 * Check and unlock achievements for a user
 */
export async function checkAndUnlockAchievements(userId: string, category: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      referralsGiven: true,
    },
  });

  if (!user) return [];

  const achievements = await prisma.achievement.findMany({
    where: {
      category,
      isActive: true,
    },
  });

  const unlocked: string[] = [];

  for (const achievement of achievements) {
    let currentValue = 0;

    // Determine current value based on achievement type
    switch (achievement.requirementType) {
      case 'donation_count':
        currentValue = user.totalCyclesCompleted;
        break;
      case 'coin_purchase_total':
        // Would need to query coin purchases
        break;
      case 'referral_count':
        currentValue = user.referralsGiven.filter(r => r.status === 'completed').length;
        break;
      case 'streak_days':
        const streak = await prisma.dailyStreak.findUnique({ where: { userId } });
        currentValue = streak?.longestStreak || 0;
        break;
    }

    if (currentValue >= achievement.requirementValue) {
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (!existing) {
        await prisma.$transaction([
          prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              progress: currentValue,
              maxProgress: achievement.requirementValue,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              charityCoinsBalance: { increment: achievement.rewardCoins },
            },
          }),
          prisma.gamificationStats.upsert({
            where: { userId },
            create: {
              userId,
              totalAchievements: 1,
              totalCoinsEarned: achievement.rewardCoins,
            },
            update: {
              totalAchievements: { increment: 1 },
              totalCoinsEarned: { increment: achievement.rewardCoins },
            },
          }),
        ]);

        unlocked.push(achievement.code);
      }
    }
  }

  return unlocked;
}

export default {
  getTodaysMissions,
  completeMission,
  updateStreak,
  getTodaysProgress,
  updateRingProgress,
  getActiveWeeklyChallenges,
  getUserWeeklyChallengeProgress,
  updateWeeklyChallengeProgress,
  checkAndUnlockAchievements,
};
