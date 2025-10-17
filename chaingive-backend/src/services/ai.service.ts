import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import winston from 'winston';

export interface RecommendationInput {
  userId: string;
  type: 'donation_timing' | 'amount_suggestion' | 'recipient_match' | 'coin_purchase';
  context?: any;
}

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  data: any;
  expiresAt: Date;
  createdAt: Date;
}

@injectable()
export class AIService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Logger') private logger: winston.Logger
  ) {}

  async generateRecommendation(input: RecommendationInput): Promise<Recommendation> {
    try {
      // Analyze user behavior and generate recommendation
      const userHistory = await this.analyzeUserHistory(input.userId);
      const recommendation = await this.createRecommendation(input, userHistory);

      // Store recommendation
      const stored = await this.prisma.aiRecommendation.create({
        data: {
          userId: input.userId,
          type: input.type,
          title: recommendation.title,
          description: recommendation.description,
          confidence: recommendation.confidence,
          data: recommendation.data,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      this.logger.info('AI recommendation generated', {
        userId: input.userId,
        type: input.type,
        recommendationId: stored.id
      });

      return {
        id: stored.id,
        type: stored.type,
        title: stored.title,
        description: stored.description,
        confidence: stored.confidence,
        data: stored.data,
        expiresAt: stored.expiresAt,
        createdAt: stored.createdAt
      };
    } catch (error) {
      this.logger.error('Failed to generate AI recommendation', { error, input });
      throw new Error('RECOMMENDATION_GENERATION_FAILED');
    }
  }

  async getUserRecommendations(userId: string, type?: string, limit: number = 10): Promise<Recommendation[]> {
    try {
      const where: any = {
        userId,
        expiresAt: { gt: new Date() }
      };

      if (type) where.type = type;

      const recommendations = await this.prisma.aiRecommendation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return recommendations.map(r => ({
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description,
        confidence: r.confidence,
        data: r.data,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt
      }));
    } catch (error) {
      this.logger.error('Failed to get user recommendations', { error, userId });
      throw new Error('RECOMMENDATIONS_FETCH_FAILED');
    }
  }

  async markRecommendationViewed(recommendationId: string, userId: string): Promise<void> {
    try {
      await this.prisma.aiRecommendation.updateMany({
        where: { id: recommendationId, userId },
        data: { viewedAt: new Date() }
      });
    } catch (error) {
      this.logger.error('Failed to mark recommendation viewed', { error, recommendationId });
    }
  }

  async markRecommendationActioned(recommendationId: string, userId: string, feedback?: string): Promise<void> {
    try {
      await this.prisma.aiRecommendation.updateMany({
        where: { id: recommendationId, userId },
        data: {
          actionedAt: new Date(),
          feedback
        }
      });
    } catch (error) {
      this.logger.error('Failed to mark recommendation actioned', { error, recommendationId });
    }
  }

  private async analyzeUserHistory(userId: string): Promise<any> {
    // Analyze user's donation history, timing patterns, success rates, etc.
    const donations = await this.prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const coinPurchases = await this.prisma.coinPurchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return {
      totalDonations: donations.length,
      successfulDonations: donations.filter(d => d.status === 'fulfilled').length,
      averageAmount: donations.reduce((sum, d) => sum + d.amount, 0) / donations.length || 0,
      preferredTimes: this.analyzeTimingPatterns(donations),
      coinPurchases: coinPurchases.length,
      lastActivity: donations[0]?.createdAt || coinPurchases[0]?.createdAt
    };
  }

  private analyzeTimingPatterns(donations: any[]): any {
    // Analyze when user typically makes donations
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);

    donations.forEach(donation => {
      const hour = donation.createdAt.getHours();
      const day = donation.createdAt.getDay();
      hourCounts[hour]++;
      dayCounts[day]++;
    });

    const preferredHour = hourCounts.indexOf(Math.max(...hourCounts));
    const preferredDay = dayCounts.indexOf(Math.max(...dayCounts));

    return { preferredHour, preferredDay };
  }

  private async createRecommendation(input: RecommendationInput, history: any): Promise<any> {
    switch (input.type) {
      case 'donation_timing':
        return this.createTimingRecommendation(history);
      case 'amount_suggestion':
        return this.createAmountRecommendation(history);
      case 'recipient_match':
        return this.createRecipientRecommendation(input.userId);
      case 'coin_purchase':
        return this.createCoinRecommendation(history);
      default:
        throw new Error('INVALID_RECOMMENDATION_TYPE');
    }
  }

  private createTimingRecommendation(history: any): any {
    const { preferredHour } = history.preferredTimes;
    const now = new Date();
    const suggestedTime = new Date(now);
    suggestedTime.setHours(preferredHour, 0, 0, 0);

    if (suggestedTime <= now) {
      suggestedTime.setDate(suggestedTime.getDate() + 1);
    }

    return {
      title: 'Optimal Donation Timing',
      description: `Based on your history, you have the highest success rate donating around ${preferredHour}:00. Consider donating at ${suggestedTime.toLocaleString()}.`,
      confidence: 0.85,
      data: { suggestedTime: suggestedTime.toISOString() }
    };
  }

  private createAmountRecommendation(history: any): any {
    const { averageAmount } = history;
    const suggestedAmount = Math.round(averageAmount * 1.1); // 10% increase

    return {
      title: 'Suggested Donation Amount',
      description: `Your average donation is $${averageAmount}. Consider increasing to $${suggestedAmount} to help more recipients.`,
      confidence: 0.78,
      data: { suggestedAmount, averageAmount }
    };
  }

  private async createRecipientRecommendation(userId: string): Promise<any> {
    // Find recipients with high success rates in user's region
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { location: true }
    });

    const successfulRecipients = await this.prisma.donation.groupBy({
      by: ['recipientId'],
      where: {
        status: 'fulfilled',
        recipient: {
          location: user?.location ? { contains: user.location.split(',')[0] } : undefined
        }
      },
      _count: { recipientId: true },
      orderBy: { _count: { recipientId: 'desc' } },
      take: 3
    });

    return {
      title: 'Recommended Recipients',
      description: 'Based on successful donations in your area, these recipients have high completion rates.',
      confidence: 0.82,
      data: { recipientIds: successfulRecipients.map(r => r.recipientId) }
    };
  }

  private createCoinRecommendation(history: any): any {
    const { coinPurchases, totalDonations } = history;
    const suggestedCoins = Math.max(50, Math.min(200, totalDonations * 10));

    return {
      title: 'Coin Purchase Suggestion',
      description: `With ${totalDonations} donations, purchasing ${suggestedCoins} coins would give you ${Math.floor(suggestedCoins/50)} Turbo Charge opportunities.`,
      confidence: 0.75,
      data: { suggestedCoins, benefits: Math.floor(suggestedCoins/50) }
    };
  }
}
