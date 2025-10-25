import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { MarketplaceService } from '../services/marketplace.service';
import logger from '../utils/logger';

const marketplaceService = new MarketplaceService();

/**
 * Get personalized marketplace recommendations
 */
export const getPersonalizedRecommendations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { limit = 10, category, priceMin, priceMax } = req.query;

    // Build user context for recommendations
    const context = {
      userId,
      userPreferences: {
        categories: category ? [category as string] : undefined,
        priceRange: priceMin || priceMax ? {
          min: priceMin ? parseFloat(priceMin as string) : 0,
          max: priceMax ? parseFloat(priceMax as string) : Number.MAX_VALUE,
        } : undefined,
      },
    };

    const recommendations = await marketplaceService.getPersonalizedRecommendations(context, parseInt(limit as string));

    // Get full item details for recommendations
    const itemIds = recommendations.map(r => r.itemId);
    const items = await prisma.marketplaceItem.findMany({
      where: {
        id: { in: itemIds },
        isActive: true,
        stockQuantity: { gt: 0 },
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    // Combine recommendations with item data
    const enrichedRecommendations = recommendations.map(rec => {
      const item = items.find(i => i.id === rec.itemId);
      return {
        ...rec,
        item: item ? {
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          coinPrice: item.coinPrice,
          realValue: item.realValue,
          imageUrl: item.imageUrl,
          stockQuantity: item.stockQuantity,
          salesCount: item._count.transactions,
        } : null,
      };
    }).filter(rec => rec.item); // Remove recommendations where item is not found or inactive

    res.status(200).json({
      success: true,
      data: {
        recommendations: enrichedRecommendations,
        total: enrichedRecommendations.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get marketplace analytics and insights
 */
export const getMarketplaceAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { timeframe = 'month' } = req.query;

    const analytics = await marketplaceService.getMarketplaceAnalytics(timeframe as 'day' | 'week' | 'month');

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get suggested new categories based on analytics
 */
export const getSuggestedCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const suggestions = await marketplaceService.suggestNewCategories();

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        total: suggestions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update recommendations based on user interaction
 */
export const updateRecommendationFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { itemId, action, rating } = req.body;

    if (!itemId || !action) {
      throw new AppError('Item ID and action are required', 400, 'MISSING_PARAMETERS');
    }

    const validActions = ['view', 'purchase', 'cart_add', 'cart_remove'];
    if (!validActions.includes(action)) {
      throw new AppError('Invalid action type', 400, 'INVALID_ACTION');
    }

    await marketplaceService.updateRecommendationsWithFeedback(
      userId,
      itemId,
      action as 'view' | 'purchase' | 'cart_add' | 'cart_remove',
      rating ? parseFloat(rating) : undefined
    );

    res.status(200).json({
      success: true,
      message: 'Recommendation feedback recorded successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trending items based on analytics
 */
export const getTrendingItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 20, timeframe = 'week' } = req.query;

    const analytics = await marketplaceService.getMarketplaceAnalytics(timeframe as 'day' | 'week' | 'month');

    // Get full item details for trending items
    const itemIds = analytics.trendingItems.map(t => t.itemId);
    const items = await prisma.marketplaceItem.findMany({
      where: {
        id: { in: itemIds },
        isActive: true,
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    // Combine trending data with item details
    const enrichedTrending = analytics.trendingItems.map(trend => {
      const item = items.find(i => i.id === trend.itemId);
      return {
        ...trend,
        item: item ? {
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          coinPrice: item.coinPrice,
          realValue: item.realValue,
          imageUrl: item.imageUrl,
          stockQuantity: item.stockQuantity,
          salesCount: item._count.transactions,
        } : null,
      };
    }).filter(trend => trend.item);

    res.status(200).json({
      success: true,
      data: {
        trendingItems: enrichedTrending,
        timeframe,
        total: enrichedTrending.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category performance analytics
 */
export const getCategoryPerformance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { timeframe = 'month' } = req.query;

    const analytics = await marketplaceService.getMarketplaceAnalytics(timeframe as 'day' | 'week' | 'month');

    res.status(200).json({
      success: true,
      data: {
        categoryPerformance: analytics.categoryPerformance,
        timeframe,
        totalCategories: analytics.categoryPerformance.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user-specific marketplace insights
 */
export const getUserMarketplaceInsights = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // Get user's purchase history
    const purchaseHistory = await prisma.marketplaceTransaction.findMany({
      where: {
        userId,
        status: 'completed',
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            category: true,
            coinPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Calculate user insights
    const totalSpent = purchaseHistory.reduce((sum, p) => sum + Number(p.totalPrice), 0);
    const favoriteCategory = this.getFavoriteCategory(purchaseHistory);
    const averageOrderValue = purchaseHistory.length > 0 ? totalSpent / purchaseHistory.length : 0;

    // Get user's coin balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { charityCoins: true },
    });

    // Get recommended items based on history
    const recommendations = await marketplaceService.getPersonalizedRecommendations({
      userId,
      analyticsData: {
        purchaseHistory: purchaseHistory.map(p => ({
          itemId: p.item.id,
          category: p.item.category,
          price: Number(p.totalPrice),
          purchasedAt: p.createdAt,
        })),
      },
    }, 5);

    res.status(200).json({
      success: true,
      data: {
        insights: {
          totalPurchases: purchaseHistory.length,
          totalSpent,
          averageOrderValue,
          favoriteCategory,
          currentCoinBalance: user?.charityCoins || 0,
        },
        recentPurchases: purchaseHistory.slice(0, 10),
        recommendations: recommendations.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to determine user's favorite category
 */
function getFavoriteCategory(purchaseHistory: any[]): string | null {
  const categoryCount: { [key: string]: number } = {};

  purchaseHistory.forEach(purchase => {
    const category = purchase.item.category;
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  const favorite = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)[0];

  return favorite ? favorite[0] : null;
}

/**
 * Get marketplace search suggestions with analytics
 */
export const getSearchSuggestions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || (query as string).length < 2) {
      return res.status(200).json({
        success: true,
        data: { suggestions: [] },
      });
    }

    // Get trending searches (would be stored in a separate table)
    const trendingSearches = [
      'airtime',
      'data bundle',
      'groceries',
      'mobile money',
      'gift cards',
    ].filter(term => term.toLowerCase().includes((query as string).toLowerCase()));

    // Get popular categories matching query
    const popularCategories = await prisma.marketplaceItem.groupBy({
      by: ['category'],
      where: {
        category: {
          contains: query as string,
          mode: 'insensitive',
        },
        isActive: true,
      },
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
      take: 5,
    });

    // Get popular items matching query
    const popularItems = await prisma.marketplaceItem.findMany({
      where: {
        OR: [
          { name: { contains: query as string, mode: 'insensitive' } },
          { description: { contains: query as string, mode: 'insensitive' } },
        ],
        isActive: true,
        stockQuantity: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        category: true,
        coinPrice: true,
      },
      orderBy: { popularityScore: 'desc' },
      take: parseInt(limit as string),
    });

    const suggestions = {
      trending: trendingSearches.slice(0, 3),
      categories: popularCategories.map(c => ({
        name: c.category,
        type: 'category',
        count: c._count.category,
      })),
      items: popularItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.coinPrice,
        type: 'item',
      })),
    };

    res.status(200).json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    next(error);
  }
};