import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import winston from 'winston';

export interface RecommendationInput {
  userId: string;
  type: 'donation_timing' | 'amount_suggestion' | 'recipient_match' | 'coin_purchase';
  context?: any;
}

export interface DonationPattern {
  averageAmount: number;
  frequency: number; // days between donations
  preferredTime: string; // hour of day
  successRate: number;
}

@injectable()
export class AIService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Logger') private logger: winston.Logger
  ) {}

  async generateRecommendation(input: RecommendationInput): Promise<any> {
    try {
      let recommendationData: any;
      let confidenceScore: number;

      switch (input.type) {
        case 'donation_timing':
          recommendationData = await this.generateTimingRecommendation(input.userId);
          confidenceScore = 0.85;
          break;
        case 'amount_suggestion':
          recommendationData = await this.generateAmountRecommendation(input.userId);
          confidenceScore = 0.75;
          break;
        case 'recipient_match':
          recommendationData = await this.generateRecipientRecommendation(input.userId);
          confidenceScore = 0.80;
          break;
        case 'coin_purchase':
          recommendationData = await this.generateCoinPurchaseRecommendation(input.userId);
          confidenceScore = 0.70;
          break;
        default:
          throw new Error('INVALID_RECOMMENDATION_TYPE');
      }

      const recommendation = await this.prisma.aiRecommendation.create({
        data: {
          userId: input.userId,
          recommendationType: input.type,
          recommendationData,
          confidenceScore,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      this.logger.info('AI recommendation generated', { 
        userId: input.userId, 
        type: input.type,
        confidence: confidenceScore 
      });

      return recommendation;
    } catch (error) {
      this.logger.error('Failed to generate recommendation', { error, input });
      throw new Error('RECOMMENDATION_GENERATION_FAILED');
    }
  }

  private async generateTimingRecommendation(userId: string): Promise<any> {
    // Analyze user's donation history to suggest optimal timing
    const donations = await this.prisma.donation.findMany({
      where: { donorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    if (donations.length < 3) {
      return {
        suggestion: 'Consider donating during weekday evenings (6-8 PM) for better recipient response rates',
        reason: 'Based on platform-wide data',
        optimalHour: 19,
        optimalDay: 'weekday'
      };
    }

    const pattern = this.analyzeDonationPattern(donations);
    const nextOptimalTime = this.calculateNextOptimalTime(pattern);

    return {
      suggestion: `Based on your history, consider donating on ${nextOptimalTime.day} around ${nextOptimalTime.hour}:00`,
      reason: 'Matches your successful donation pattern',
      optimalHour: nextOptimalTime.hour,
      optimalDay: nextOptimalTime.day,
      confidence: pattern.successRate
    };
  }

  private async generateAmountRecommendation(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { donations: { take: 10, orderBy: { createdAt: 'desc' } } }
    });

    if (!user) throw new Error('USER_NOT_FOUND');

    const avgAmount = user.donations.length > 0 
      ? user.donations.reduce((sum, d) => sum + d.amount, 0) / user.donations.length
      : 50;

    const suggestedAmount = Math.round(avgAmount * 1.1); // 10% increase

    return {
      suggestedAmount,
      reason: 'Slightly higher than your average to maximize impact',
      minAmount: Math.round(avgAmount * 0.8),
      maxAmount: Math.round(avgAmount * 1.5),
      impactScore: this.calculateImpactScore(suggestedAmount)
    };
  }

  private async generateRecipientRecommendation(userId: string): Promise<any> {
    // Find recipients with similar profiles or in user's preferred regions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { donations: { include: { recipient: true } } }
    });

    if (!user) throw new Error('USER_NOT_FOUND');

    // Analyze past recipient preferences
    const pastRecipients = user.donations.map(d => d.recipient);
    const preferredRegions = this.extractPreferredRegions(pastRecipients);

    // Find similar recipients currently in queue
    const potentialRecipients = await this.prisma.user.findMany({
      where: {
        isReceiving: true,
        location: { in: preferredRegions },
        id: { not: userId }
      },
      take: 5,
      orderBy: { trustScore: 'desc' }
    });

    return {
      recommendedRecipients: potentialRecipients.map(r => ({
        id: r.id,
        displayName: r.displayName,
        location: r.location,
        trustScore: r.trustScore,
        matchReason: 'Similar to your previous successful donations'
      })),
      reason: 'Based on your donation history and recipient success rates'
    };
  }

  private async generateCoinPurchaseRecommendation(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) throw new Error('USER_NOT_FOUND');

    const currentCoins = user.charityCoins || 0;
    const leaderboardPosition = await this.getUserLeaderboardPosition(userId);

    let recommendation: any = {
      currentCoins,
      leaderboardPosition
    };

    if (currentCoins < 100) {
      recommendation = {
        ...recommendation,
        suggestion: 'Purchase 200 coins to unlock Turbo Charge feature',
        suggestedAmount: 200,
        reason: 'Turbo Charge can help you move up the leaderboard faster',
        benefits: ['Skip queue positions', 'Faster donation matching', 'Premium features access']
      };
    } else if (leaderboardPosition > 100) {
      recommendation = {
        ...recommendation,
        suggestion: 'Consider purchasing 500 coins for multiple Turbo Charges',
        suggestedAmount: 500,
        reason: 'Multiple boosts can significantly improve your ranking',
        benefits: ['Multiple queue skips', 'Better matching priority', 'Exclusive rewards']
      };
    } else {
      recommendation = {
        ...recommendation,
        suggestion: 'Your coin balance looks good! Save coins for strategic moments',
        suggestedAmount: 0,
        reason: 'Current balance is sufficient for your activity level'
      };
    }

    return recommendation;
  }

  private analyzeDonationPattern(donations: any[]): DonationPattern {
    const amounts = donations.map(d => d.amount);
    const times = donations.map(d => new Date(d.createdAt).getHours());
    const dates = donations.map(d => new Date(d.createdAt));

    const averageAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const mostCommonHour = this.getMostFrequent(times);
    
    // Calculate frequency (average days between donations)
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      const daysDiff = (dates[i-1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }
    const frequency = intervals.length > 0 
      ? intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length 
      : 30;

    return {
      averageAmount,
      frequency,
      preferredTime: `${mostCommonHour}:00`,
      successRate: 0.85 // Placeholder - would calculate based on completion rates
    };
  }

  private calculateNextOptimalTime(pattern: DonationPattern): { day: string, hour: number } {
    const now = new Date();
    const nextDonationDate = new Date(now.getTime() + pattern.frequency * 24 * 60 * 60 * 1000);
    
    return {
      day: nextDonationDate.toLocaleDateString('en-US', { weekday: 'long' }),
      hour: parseInt(pattern.preferredTime.split(':')[0])
    };
  }

  private calculateImpactScore(amount: number): number {
    // Simple impact calculation - could be more sophisticated
    return Math.min(100, Math.round((amount / 10) * 2));
  }

  private extractPreferredRegions(recipients: any[]): string[] {
    const regions = recipients.map(r => r.location).filter(Boolean);
    const regionCounts = regions.reduce((acc, region) => {
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(regionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([region]) => region);
  }

  private getMostFrequent<T>(arr: T[]): T {
    const counts = arr.reduce((acc, item) => {
      acc[item as any] = (acc[item as any] || 0) + 1;
      return acc;
    }, {} as Record<any, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0][0] as T;
  }

  private async getUserLeaderboardPosition(userId: string): Promise<number> {
    // Simplified leaderboard position calculation
    const usersAbove = await this.prisma.user.count({
      where: {
        OR: [
          { totalDonations: { gt: await this.getUserTotalDonations(userId) } },
          { charityCoins: { gt: await this.getUserCoins(userId) } }
        ]
      }
    });

    return usersAbove + 1;
  }

  private async getUserTotalDonations(userId: string): Promise<number> {
    const result = await this.prisma.donation.aggregate({
      where: { donorId: userId },
      _sum: { amount: true }
    });
    return result._sum.amount || 0;
  }

  private async getUserCoins(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { charityCoins: true }
    });
    return user?.charityCoins || 0;
  }
}