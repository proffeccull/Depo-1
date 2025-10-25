import { Injectable } from 'inversify';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  criteria: AchievementCriteria;
  isActive: boolean;
}

export interface AchievementCriteria {
  type: 'count' | 'streak' | 'milestone' | 'social' | 'giving';
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  conditions?: Record<string, any>;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  change: number; // position change from last period
  badges: string[];
}

export interface UserProgress {
  userId: string;
  level: number;
  experiencePoints: number;
  experienceToNext: number;
  totalAchievements: number;
  recentAchievements: Achievement[];
  currentStreaks: Record<string, number>;
  weeklyStats: {
    donations: number;
    recipientsHelped: number;
    coinsEarned: number;
    communityPosts: number;
  };
}

@Injectable()
export class GamificationService {
  private readonly achievements: Achievement[] = [
    // Giving Achievements
    {
      id: 'first_donation',
      title: 'First Steps',
      description: 'Complete your first donation',
      icon: 'heart',
      category: 'giving',
      rarity: 'common',
      points: 100,
      criteria: { type: 'count', target: 1, conditions: { donation_completed: true } },
      isActive: true
    },
    {
      id: 'generous_giver',
      title: 'Generous Giver',
      description: 'Complete 10 donations',
      icon: 'gift',
      category: 'giving',
      rarity: 'common',
      points: 500,
      criteria: { type: 'count', target: 10, conditions: { donation_completed: true } },
      isActive: true
    },
    {
      id: 'community_hero',
      title: 'Community Hero',
      description: 'Help 50 different people',
      icon: 'shield',
      category: 'giving',
      rarity: 'rare',
      points: 2000,
      criteria: { type: 'count', target: 50, conditions: { unique_recipients: true } },
      isActive: true
    },
    {
      id: 'pay_it_forward_master',
      title: 'Pay It Forward Master',
      description: 'Complete 100 donations',
      icon: 'crown',
      category: 'giving',
      rarity: 'epic',
      points: 5000,
      criteria: { type: 'count', target: 100, conditions: { donation_completed: true } },
      isActive: true
    },

    // Streak Achievements
    {
      id: 'consistent_helper',
      title: 'Consistent Helper',
      description: 'Help someone 7 days in a row',
      icon: 'calendar',
      category: 'streak',
      rarity: 'rare',
      points: 1000,
      criteria: { type: 'streak', target: 7, timeframe: 'daily' },
      isActive: true
    },
    {
      id: 'dedicated_supporter',
      title: 'Dedicated Supporter',
      description: 'Maintain a 30-day helping streak',
      icon: 'flame',
      category: 'streak',
      rarity: 'epic',
      points: 3000,
      criteria: { type: 'streak', target: 30, timeframe: 'daily' },
      isActive: true
    },

    // Social Achievements
    {
      id: 'storyteller',
      title: 'Storyteller',
      description: 'Share 5 success stories',
      icon: 'book',
      category: 'social',
      rarity: 'common',
      points: 300,
      criteria: { type: 'count', target: 5, conditions: { post_type: 'story' } },
      isActive: true
    },
    {
      id: 'community_builder',
      title: 'Community Builder',
      description: 'Create 3 community events',
      icon: 'users',
      category: 'social',
      rarity: 'rare',
      points: 1500,
      criteria: { type: 'count', target: 3, conditions: { event_created: true } },
      isActive: true
    },
    {
      id: 'influencer',
      title: 'Community Influencer',
      description: 'Receive 100 likes on your posts',
      icon: 'star',
      category: 'social',
      rarity: 'epic',
      points: 2500,
      criteria: { type: 'count', target: 100, conditions: { post_likes_received: true } },
      isActive: true
    },

    // Milestone Achievements
    {
      id: 'coin_collector',
      title: 'Coin Collector',
      description: 'Earn 1000 Charity Coins',
      icon: 'coins',
      category: 'milestone',
      rarity: 'common',
      points: 200,
      criteria: { type: 'milestone', target: 1000, conditions: { coins_earned: true } },
      isActive: true
    },
    {
      id: 'marketplace_explorer',
      title: 'Marketplace Explorer',
      description: 'Make 10 marketplace purchases',
      icon: 'shopping-bag',
      category: 'milestone',
      rarity: 'rare',
      points: 800,
      criteria: { type: 'count', target: 10, conditions: { marketplace_purchase: true } },
      isActive: true
    }
  ];

  private readonly levelThresholds = [
    0,      // Level 1
    1000,   // Level 2
    2500,   // Level 3
    5000,   // Level 4
    8000,   // Level 5
    12000,  // Level 6
    17000,  // Level 7
    23000,  // Level 8
    30000,  // Level 9
    40000   // Level 10
  ];

  /**
   * Get all available achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    return this.achievements.filter(achievement => achievement.isActive);
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<any[]> {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' }
    });

    return userAchievements.map(ua => ({
      ...ua.achievement,
      earnedAt: ua.earnedAt,
      progress: ua.progress
    }));
  }

  /**
   * Check and award achievements
   */
  async checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
    const awardedAchievements: Achievement[] = [];

    for (const achievement of this.achievements) {
      const hasAchievement = await prisma.userAchievement.findFirst({
        where: { userId, achievementId: achievement.id }
      });

      if (hasAchievement) continue;

      const meetsCriteria = await this.checkAchievementCriteria(userId, achievement);
      if (meetsCriteria) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            earnedAt: new Date()
          }
        });

        // Award experience points
        await this.awardExperiencePoints(userId, achievement.points);

        awardedAchievements.push(achievement);
        logger.info(`User ${userId} earned achievement: ${achievement.title}`);
      }
    }

    return awardedAchievements;
  }

  /**
   * Check if user meets achievement criteria
   */
  private async checkAchievementCriteria(userId: string, achievement: Achievement): Promise<boolean> {
    const { criteria } = achievement;

    switch (criteria.type) {
      case 'count':
        return await this.checkCountCriteria(userId, criteria);

      case 'streak':
        return await this.checkStreakCriteria(userId, criteria);

      case 'milestone':
        return await this.checkMilestoneCriteria(userId, criteria);

      case 'social':
        return await this.checkSocialCriteria(userId, criteria);

      default:
        return false;
    }
  }

  private async checkCountCriteria(userId: string, criteria: AchievementCriteria): Promise<boolean> {
    const { conditions } = criteria;

    if (conditions.donation_completed) {
      const donationCount = await prisma.donation.count({
        where: { donorId: userId, status: 'completed' }
      });
      return donationCount >= criteria.target;
    }

    if (conditions.unique_recipients) {
      const uniqueRecipients = await prisma.donation.findMany({
        where: { donorId: userId, status: 'completed' },
        select: { recipientId: true },
        distinct: ['recipientId']
      });
      return uniqueRecipients.length >= criteria.target;
    }

    if (conditions.post_type === 'story') {
      const postCount = await prisma.communityPost.count({
        where: { authorId: userId, type: 'story' }
      });
      return postCount >= criteria.target;
    }

    if (conditions.event_created) {
      const eventCount = await prisma.communityEvent.count({
        where: { creatorId: userId }
      });
      return eventCount >= criteria.target;
    }

    if (conditions.marketplace_purchase) {
      const purchaseCount = await prisma.marketplaceTransaction.count({
        where: { userId, status: 'completed' }
      });
      return purchaseCount >= criteria.target;
    }

    return false;
  }

  private async checkStreakCriteria(userId: string, criteria: AchievementCriteria): Promise<boolean> {
    // Calculate current streak based on donation activity
    const donations = await prisma.donation.findMany({
      where: {
        donorId: userId,
        status: 'completed',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    if (donations.length < criteria.target) return false;

    // Check for consecutive days
    const dates = donations.map(d => d.createdAt.toDateString());
    const uniqueDates = [...new Set(dates)];

    // Simple streak check - user has been active on target number of different days
    return uniqueDates.length >= criteria.target;
  }

  private async checkMilestoneCriteria(userId: string, criteria: AchievementCriteria): Promise<boolean> {
    const { conditions } = criteria;

    if (conditions.coins_earned) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { charityCoins: true }
      });
      return (user?.charityCoins || 0) >= criteria.target;
    }

    return false;
  }

  private async checkSocialCriteria(userId: string, criteria: AchievementCriteria): Promise<boolean> {
    const { conditions } = criteria;

    if (conditions.post_likes_received) {
      const posts = await prisma.communityPost.findMany({
        where: { authorId: userId },
        select: { id: true }
      });

      const postIds = posts.map(p => p.id);
      const totalLikes = await prisma.postLike.count({
        where: { postId: { in: postIds } }
      });

      return totalLikes >= criteria.target;
    }

    return false;
  }

  /**
   * Award experience points and handle leveling
   */
  private async awardExperiencePoints(userId: string, points: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { experiencePoints: true, level: true }
    });

    if (!user) return;

    const newExperience = user.experiencePoints + points;
    let newLevel = user.level;

    // Check for level up
    while (newLevel < this.levelThresholds.length &&
           newExperience >= this.levelThresholds[newLevel]) {
      newLevel++;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        experiencePoints: newExperience,
        level: newLevel
      }
    });

    if (newLevel > user.level) {
      logger.info(`User ${userId} leveled up to ${newLevel}`);
      // Could trigger level-up notifications here
    }
  }

  /**
   * Get user progress and stats
   */
  async getUserProgress(userId: string): Promise<UserProgress> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        experiencePoints: true,
        _count: {
          select: {
            userAchievements: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentLevelThreshold = this.levelThresholds[user.level - 1] || 0;
    const nextLevelThreshold = this.levelThresholds[user.level] || this.levelThresholds[this.levelThresholds.length - 1];
    const experienceToNext = nextLevelThreshold - user.experiencePoints;

    // Get recent achievements
    const recentAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' },
      take: 5
    });

    // Calculate weekly stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const weeklyStats = await this.calculateWeeklyStats(userId, weekStart);

    return {
      userId,
      level: user.level,
      experiencePoints: user.experiencePoints,
      experienceToNext,
      totalAchievements: user._count.userAchievements,
      recentAchievements: recentAchievements.map(ua => ua.achievement),
      currentStreaks: await this.calculateCurrentStreaks(userId),
      weeklyStats
    };
  }

  private async calculateWeeklyStats(userId: string, weekStart: Date): Promise<UserProgress['weeklyStats']> {
    const [donations, recipients, coinsEarned, posts] = await Promise.all([
      prisma.donation.count({
        where: {
          donorId: userId,
          status: 'completed',
          createdAt: { gte: weekStart }
        }
      }),
      prisma.donation.findMany({
        where: {
          donorId: userId,
          status: 'completed',
          createdAt: { gte: weekStart }
        },
        select: { recipientId: true },
        distinct: ['recipientId']
      }),
      prisma.coinTransaction.aggregate({
        where: {
          userId,
          type: 'earned',
          createdAt: { gte: weekStart }
        },
        _sum: { amount: true }
      }),
      prisma.communityPost.count({
        where: {
          authorId: userId,
          createdAt: { gte: weekStart }
        }
      })
    ]);

    return {
      donations,
      recipientsHelped: recipients.length,
      coinsEarned: coinsEarned._sum.amount || 0,
      communityPosts: posts
    };
  }

  private async calculateCurrentStreaks(userId: string): Promise<Record<string, number>> {
    // Calculate donation streak
    const recentDonations = await prisma.donation.findMany({
      where: {
        donorId: userId,
        status: 'completed'
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { createdAt: true }
    });

    const dates = recentDonations.map(d => d.createdAt.toDateString());
    const uniqueDates = [...new Set(dates)];

    // Simple streak calculation
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      streak = 1;
      for (let i = 1; i <= 30; i++) {
        const checkDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
        if (uniqueDates.includes(checkDate)) {
          streak++;
        } else {
          break;
        }
      }
    }

    return { donations: streak };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    type: 'experience' | 'donations' | 'recipients' | 'coins' = 'experience',
    timeframe: 'weekly' | 'monthly' | 'all_time' = 'monthly',
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    let orderBy: any;
    let where: any = {};

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    where.createdAt = { gte: startDate };

    switch (type) {
      case 'experience':
        orderBy = { experiencePoints: 'desc' };
        break;
      case 'donations':
        // This would require aggregation - simplified for now
        orderBy = { experiencePoints: 'desc' }; // Placeholder
        break;
      case 'coins':
        orderBy = { charityCoins: 'desc' };
        break;
      default:
        orderBy = { experiencePoints: 'desc' };
    }

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        experiencePoints: true,
        charityCoins: true,
        level: true
      },
      orderBy,
      take: limit
    });

    return users.map((user, index) => ({
      userId: user.id,
      username: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || undefined,
      score: type === 'coins' ? user.charityCoins : user.experiencePoints,
      rank: index + 1,
      change: 0, // Would need historical data to calculate
      badges: [] // Would be populated based on achievements
    }));
  }

  /**
   * Update user streaks and check for streak-based achievements
   */
  async updateUserStreaks(userId: string): Promise<void> {
    // This would be called periodically or after user actions
    await this.checkAndAwardAchievements(userId);
  }

  /**
   * Get achievement progress for user
   */
  async getAchievementProgress(userId: string): Promise<any[]> {
    const progress = [];

    for (const achievement of this.achievements) {
      const hasAchievement = await prisma.userAchievement.findFirst({
        where: { userId, achievementId: achievement.id }
      });

      if (hasAchievement) {
        progress.push({
          ...achievement,
          status: 'completed',
          progress: 100,
          earnedAt: hasAchievement.earnedAt
        });
      } else {
        // Calculate progress
        const currentProgress = await this.calculateAchievementProgress(userId, achievement);
        progress.push({
          ...achievement,
          status: 'in_progress',
          progress: Math.min(currentProgress, 100)
        });
      }
    }

    return progress;
  }

  private async calculateAchievementProgress(userId: string, achievement: Achievement): Promise<number> {
    const { criteria } = achievement;

    switch (criteria.type) {
      case 'count':
        if (criteria.conditions?.donation_completed) {
          const count = await prisma.donation.count({
            where: { donorId: userId, status: 'completed' }
          });
          return Math.min((count / criteria.target) * 100, 100);
        }
        break;

      case 'milestone':
        if (criteria.conditions?.coins_earned) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { charityCoins: true }
          });
          return Math.min(((user?.charityCoins || 0) / criteria.target) * 100, 100);
        }
        break;
    }

    return 0;
  }
}