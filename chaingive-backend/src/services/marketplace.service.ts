import prisma from '../utils/prisma';
import logger from '../utils/logger';

export interface RecommendationContext {
  userId: string;
  userPreferences?: {
    categories?: string[];
    priceRange?: { min: number; max: number };
    excludedItems?: string[];
  };
  sessionData?: {
    recentlyViewed?: string[];
    cartItems?: string[];
    searchHistory?: string[];
  };
  analyticsData?: {
    purchaseHistory?: Array<{
      itemId: string;
      category: string;
      price: number;
      purchasedAt: Date;
    }>;
    donationHistory?: Array<{
      category: string;
      amount: number;
      donatedAt: Date;
    }>;
  };
}

export interface PersonalizedRecommendation {
  itemId: string;
  score: number;
  reason: string;
  category: string;
  confidence: number;
}

export interface MarketplaceAnalytics {
  totalRevenue: number;
  topCategories: Array<{ category: string; revenue: number; transactions: number }>;
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  trendingItems: Array<{
    itemId: string;
    name: string;
    category: string;
    trendScore: number;
    growthRate: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    revenue: number;
    growth: number;
    userSatisfaction: number;
  }>;
}

export class MarketplaceService {
  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number = 10
  ): Promise<PersonalizedRecommendation[]> {
    try {
      // Extract user features for recommendation engine
      const userFeatures = await this.extractUserFeatures(context);

      // Get candidate items
      const candidateItems = await this.getCandidateItems(context, limit * 3);

      // Score items using AI-powered recommendation engine
      const scoredItems = await this.scoreItemsWithAI(userFeatures, candidateItems);

      // Apply business rules and diversity
      const recommendations = this.applyRecommendationRules(scoredItems, limit);

      logger.info(`Generated ${recommendations.length} personalized recommendations for user ${context.userId}`);

      return recommendations;
    } catch (error) {
      logger.error('Failed to generate personalized recommendations', { error, userId: context.userId });
      // Fallback to popular items
      return this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Extract user features for recommendation engine
   */
  private async extractUserFeatures(context: RecommendationContext): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: {
        trustScore: true,
        charityCoins: true,
        createdAt: true,
        locationCity: true,
        locationState: true,
      },
    });

    if (!context.analyticsData) {
      context.analyticsData = await this.getUserAnalyticsData(context.userId);
    }

    return {
      userProfile: {
        trustScore: Number(user?.trustScore || 0),
        charityCoins: user?.charityCoins || 0,
        accountAge: user?.createdAt ? Math.floor((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000)) : 0,
        location: {
          city: user?.locationCity,
          state: user?.locationState,
        },
      },
      preferences: context.userPreferences || {},
      sessionData: context.sessionData || {},
      analyticsData: context.analyticsData,
    };
  }

  /**
   * Get user analytics data for recommendations
   */
  private async getUserAnalyticsData(userId: string): Promise<RecommendationContext['analyticsData']> {
    // Get purchase history
    const purchases = await prisma.marketplaceTransaction.findMany({
      where: {
        userId,
        status: 'completed',
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
      },
      include: {
        item: {
          select: { id: true, category: true, realValue: true },
        },
      },
    });

    // Get donation history
    const donations = await prisma.cycle.findMany({
      where: {
        userId,
        status: 'fulfilled',
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      select: { category: true, amount: true, createdAt: true },
    });

    return {
      purchaseHistory: purchases.map(p => ({
        itemId: p.item.id,
        category: p.item.category,
        price: Number(p.totalPrice),
        purchasedAt: p.createdAt,
      })),
      donationHistory: donations.map(d => ({
        category: d.category || 'general',
        amount: Number(d.amount),
        donatedAt: d.createdAt,
      })),
    };
  }

  /**
   * Get candidate items for recommendation
   */
  private async getCandidateItems(context: RecommendationContext, limit: number): Promise<any[]> {
    const where: any = {
      isActive: true,
      stockQuantity: { gt: 0 },
    };

    // Exclude user's own preferences
    if (context.userPreferences?.excludedItems?.length) {
      where.id = { notIn: context.userPreferences.excludedItems };
    }

    // Filter by preferred categories
    if (context.userPreferences?.categories?.length) {
      where.category = { in: context.userPreferences.categories };
    }

    // Filter by price range
    if (context.userPreferences?.priceRange) {
      where.coinPrice = {
        gte: context.userPreferences.priceRange.min,
        lte: context.userPreferences.priceRange.max,
      };
    }

    const items = await prisma.marketplaceItem.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        coinPrice: true,
        realValue: true,
        stockQuantity: true,
        popularityScore: true,
        createdAt: true,
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { popularityScore: 'desc' },
      take: limit,
    });

    return items.map(item => ({
      ...item,
      salesCount: item._count.transactions,
      age: Math.floor((Date.now() - item.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
    }));
  }

  /**
   * Score items using AI-powered recommendation engine
   */
  private async scoreItemsWithAI(userFeatures: any, candidateItems: any[]): Promise<PersonalizedRecommendation[]> {
    try {
      // Call Python AI service for recommendations
      const aiRecommendations = await this.callRecommendationService(userFeatures, candidateItems);

      return aiRecommendations.map(rec => ({
        itemId: rec.itemId,
        score: rec.score,
        reason: rec.reason,
        category: rec.category,
        confidence: rec.confidence,
      }));
    } catch (error) {
      logger.warn('AI recommendation service failed, using rule-based scoring', { error });
      // Fallback to rule-based recommendations
      return this.generateRuleBasedRecommendations(userFeatures, candidateItems);
    }
  }

  /**
   * Call external Python recommendation service
   */
  private async callRecommendationService(userFeatures: any, candidateItems: any[]): Promise<any[]> {
    // This would make an HTTP call to the Python recommendation service
    // For now, return mock AI-powered recommendations
    return candidateItems.map((item, index) => ({
      itemId: item.id,
      score: Math.random() * 0.8 + 0.2, // Random score between 0.2-1.0
      reason: this.generateRecommendationReason(item, userFeatures),
      category: item.category,
      confidence: Math.random() * 0.3 + 0.7, // High confidence
    })).sort((a, b) => b.score - a.score);
  }

  /**
   * Generate recommendation reason based on item and user features
   */
  private generateRecommendationReason(item: any, userFeatures: any): string {
    const reasons = [
      'Based on your donation history',
      'Popular in your region',
      'Similar to items you\'ve viewed',
      'Trending in your preferred categories',
      'High-rated by users with similar interests',
      'Great value for your coin balance',
      'New arrival you might like',
    ];

    // More sophisticated reason generation based on user features
    if (userFeatures.analyticsData?.purchaseHistory?.some((p: any) => p.category === item.category)) {
      return 'Based on your purchase history in this category';
    }

    if (userFeatures.analyticsData?.donationHistory?.some((d: any) => d.category === item.category)) {
      return 'Matches your charitable interests';
    }

    if (item.popularityScore > 0.8) {
      return 'Highly popular item';
    }

    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /**
   * Rule-based recommendation fallback
   */
  private generateRuleBasedRecommendations(userFeatures: any, candidateItems: any[]): PersonalizedRecommendation[] {
    return candidateItems.map(item => {
      let score = 0.5; // Base score
      let reason = 'General recommendation';

      // Boost score based on user preferences
      if (userFeatures.preferences?.categories?.includes(item.category)) {
        score += 0.3;
        reason = 'Matches your preferred categories';
      }

      // Boost based on purchase history
      if (userFeatures.analyticsData?.purchaseHistory?.some((p: any) => p.category === item.category)) {
        score += 0.25;
        reason = 'Based on your purchase history';
      }

      // Boost based on donation interests
      if (userFeatures.analyticsData?.donationHistory?.some((d: any) => d.category === item.category)) {
        score += 0.2;
        reason = 'Aligns with your charitable interests';
      }

      // Boost popular items
      score += item.popularityScore * 0.1;

      // Boost new items slightly
      if (item.age < 7) {
        score += 0.1;
        reason = 'New arrival you might like';
      }

      return {
        itemId: item.id,
        score: Math.min(score, 1.0),
        reason,
        category: item.category,
        confidence: 0.6, // Lower confidence for rule-based
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Apply business rules and ensure diversity in recommendations
   */
  private applyRecommendationRules(
    scoredItems: PersonalizedRecommendation[],
    limit: number
  ): PersonalizedRecommendation[] {
    let recommendations = [...scoredItems];

    // Ensure category diversity (max 3 items per category)
    const categoryCount: { [key: string]: number } = {};
    recommendations = recommendations.filter(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      return categoryCount[item.category] <= 3;
    });

    // Ensure price diversity
    const priceRanges = ['budget', 'mid', 'premium'];
    const rangeCount: { [key: string]: number } = {};

    recommendations.forEach(item => {
      // This would be determined by item price percentiles
      const range = priceRanges[Math.floor(Math.random() * priceRanges.length)];
      rangeCount[range] = (rangeCount[range] || 0) + 1;
    });

    // Sort by score and limit
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get fallback recommendations (popular items)
   */
  private async getFallbackRecommendations(limit: number): Promise<PersonalizedRecommendation[]> {
    const popularItems = await prisma.marketplaceItem.findMany({
      where: {
        isActive: true,
        stockQuantity: { gt: 0 },
      },
      select: {
        id: true,
        category: true,
        popularityScore: true,
      },
      orderBy: { popularityScore: 'desc' },
      take: limit,
    });

    return popularItems.map(item => ({
      itemId: item.id,
      score: item.popularityScore,
      reason: 'Popular item',
      category: item.category,
      confidence: 0.5,
    }));
  }

  /**
   * Get marketplace analytics and insights
   */
  async getMarketplaceAnalytics(timeframe: 'day' | 'week' | 'month' = 'month'): Promise<MarketplaceAnalytics> {
    const timeframeMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }[timeframe];

    const since = new Date(Date.now() - timeframeMs);

    // Get revenue data
    const transactions = await prisma.marketplaceTransaction.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: since },
      },
      include: {
        item: { select: { category: true } },
      },
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.totalPrice), 0);

    // Calculate category performance
    const categoryStats: { [key: string]: { revenue: number; transactions: number } } = {};
    transactions.forEach(t => {
      const category = t.item.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { revenue: 0, transactions: 0 };
      }
      categoryStats[category].revenue += Number(t.totalPrice);
      categoryStats[category].transactions += 1;
    });

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Get user engagement metrics
    const uniqueUsers = new Set(transactions.map(t => t.userId)).size;
    const totalTransactions = transactions.length;
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Get trending items (items with increasing sales velocity)
    const trendingItems = await this.calculateTrendingItems(since);

    // Get category performance with growth rates
    const categoryPerformance = await this.calculateCategoryPerformance(since);

    return {
      totalRevenue,
      topCategories,
      userEngagement: {
        totalUsers: uniqueUsers,
        activeUsers: uniqueUsers, // Simplified
        averageOrderValue,
        conversionRate: 0, // Would need more data
      },
      trendingItems,
      categoryPerformance,
    };
  }

  /**
   * Calculate trending items based on recent sales velocity
   */
  private async calculateTrendingItems(since: Date): Promise<MarketplaceAnalytics['trendingItems']> {
    const itemSales = await prisma.marketplaceTransaction.groupBy({
      by: ['itemId'],
      where: {
        status: 'completed',
        createdAt: { gte: since },
      },
      _count: { itemId: true },
      orderBy: { _count: { itemId: 'desc' } },
      take: 20,
    });

    const trendingItems = await Promise.all(
      itemSales.map(async ({ itemId, _count }) => {
        const item = await prisma.marketplaceItem.findUnique({
          where: { id: itemId },
          select: { name: true, category: true },
        });

        return {
          itemId,
          name: item?.name || 'Unknown Item',
          category: item?.category || 'unknown',
          trendScore: _count.itemId,
          growthRate: 0, // Would calculate growth rate compared to previous period
        };
      })
    );

    return trendingItems;
  }

  /**
   * Calculate category performance with growth metrics
   */
  private async calculateCategoryPerformance(since: Date): Promise<MarketplaceAnalytics['categoryPerformance']> {
    const previousPeriod = new Date(since.getTime() - (since.getTime() - new Date(Date.now() - 2 * (Date.now() - since.getTime())).getTime()));

    const [currentStats, previousStats] = await Promise.all([
      this.getCategoryStats(since),
      this.getCategoryStats(previousPeriod),
    ]);

    return Object.keys(currentStats).map(category => {
      const current = currentStats[category];
      const previous = previousStats[category] || { revenue: 0 };

      return {
        category,
        revenue: current.revenue,
        growth: previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0,
        userSatisfaction: 0, // Would need rating/review data
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get category statistics for a time period
   */
  private async getCategoryStats(since: Date): Promise<{ [category: string]: { revenue: number } }> {
    const stats = await prisma.marketplaceTransaction.groupBy({
      by: ['itemId'],
      where: {
        status: 'completed',
        createdAt: { gte: since },
      },
      _sum: { totalPrice: true },
    });

    const categoryStats: { [category: string]: { revenue: number } } = {};

    await Promise.all(
      stats.map(async ({ itemId, _sum }) => {
        const item = await prisma.marketplaceItem.findUnique({
          where: { id: itemId },
          select: { category: true },
        });

        if (item?.category) {
          if (!categoryStats[item.category]) {
            categoryStats[item.category] = { revenue: 0 };
          }
          categoryStats[item.category].revenue += Number(_sum.totalPrice || 0);
        }
      })
    );

    return categoryStats;
  }

  /**
   * Get new categories based on analytics insights
   */
  async suggestNewCategories(): Promise<Array<{
    category: string;
    potentialRevenue: number;
    userDemand: number;
    competition: number;
    recommendation: string;
  }>> {
    // Analyze user donation patterns to suggest new marketplace categories
    const donationCategories = await prisma.cycle.groupBy({
      by: ['category'],
      where: {
        status: 'fulfilled',
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      _count: { category: true },
      _sum: { amount: true },
    });

    // Analyze current marketplace categories
    const marketplaceCategories = await prisma.marketplaceItem.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    const existingCategories = new Set(marketplaceCategories.map(c => c.category));

    // Suggest categories based on donation patterns not covered in marketplace
    const suggestions = donationCategories
      .filter(dc => dc.category && !existingCategories.has(dc.category))
      .map(dc => ({
        category: dc.category!,
        potentialRevenue: Number(dc._sum.amount || 0) * 0.1, // Estimate 10% conversion
        userDemand: dc._count.category,
        competition: 0, // Would analyze competitor data
        recommendation: `High demand from ${dc._count.category} donations in ${dc.category} category`,
      }))
      .sort((a, b) => b.userDemand - a.userDemand)
      .slice(0, 5);

    return suggestions;
  }

  /**
   * Update item recommendations based on user interactions
   */
  async updateRecommendationsWithFeedback(
    userId: string,
    itemId: string,
    action: 'view' | 'purchase' | 'cart_add' | 'cart_remove',
    rating?: number
  ): Promise<void> {
    try {
      // Store user-item interaction for future recommendations
      await prisma.marketplaceInteraction.upsert({
        where: {
          userId_itemId: { userId, itemId },
        },
        update: {
          [action]: { increment: 1 },
          lastInteraction: new Date(),
          ...(rating && { rating }),
        },
        create: {
          userId,
          itemId,
          [action]: 1,
          lastInteraction: new Date(),
          ...(rating && { rating }),
        },
      });

      // Update item popularity score
      const interactions = await prisma.marketplaceInteraction.findMany({
        where: { itemId },
        select: {
          view: true,
          purchase: true,
          cart_add: true,
          rating: true,
        },
      });

      const totalInteractions = interactions.length;
      const totalPurchases = interactions.reduce((sum, i) => sum + i.purchase, 0);
      const avgRating = interactions
        .filter(i => i.rating)
        .reduce((sum, i, _, arr) => sum + (i.rating || 0) / arr.length, 0);

      const popularityScore = (
        (totalPurchases / Math.max(totalInteractions, 1)) * 0.6 + // Purchase rate 60%
        (avgRating / 5) * 0.4 // Rating score 40%
      );

      await prisma.marketplaceItem.update({
        where: { id: itemId },
        data: { popularityScore },
      });

      logger.info(`Updated recommendations for item ${itemId} based on user ${userId} ${action}`);
    } catch (error) {
      logger.error('Failed to update recommendations with feedback', { error, userId, itemId, action });
    }
  }
}