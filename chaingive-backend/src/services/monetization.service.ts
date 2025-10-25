import { Injectable } from 'inversify';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  maxUsers?: number;
  priority: number;
}

export interface InAppPurchase {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'coins' | 'premium_feature' | 'cosmetic';
  value: number; // coins amount or feature duration in days
  isActive: boolean;
  category: string;
}

@Injectable()
export class MonetizationService {
  private readonly subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Essential features for individual users',
      price: 0,
      currency: 'NGN',
      interval: 'monthly',
      features: [
        'Basic donation matching',
        'Community access',
        'Standard marketplace',
        'Basic analytics'
      ],
      isActive: true,
      priority: 1
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Enhanced features for active community members',
      price: 2500,
      currency: 'NGN',
      interval: 'monthly',
      features: [
        'Priority matching',
        'Advanced analytics',
        'Premium marketplace discounts',
        'Ad-free experience',
        'Early access to features',
        'Priority support'
      ],
      isActive: true,
      priority: 2
    },
    {
      id: 'community_leader',
      name: 'Community Leader',
      description: 'For community organizers and influencers',
      price: 5000,
      currency: 'NGN',
      interval: 'monthly',
      features: [
        'All Premium features',
        'Event creation tools',
        'Advanced moderation',
        'Community analytics',
        'Custom branding',
        'API access',
        'Dedicated support'
      ],
      isActive: true,
      maxUsers: 100,
      priority: 3
    }
  ];

  private readonly inAppPurchases: InAppPurchase[] = [
    {
      id: 'coin_pack_small',
      name: 'Coin Pack (Small)',
      description: '500 Charity Coins',
      price: 500,
      currency: 'NGN',
      type: 'coins',
      value: 500,
      isActive: true,
      category: 'coins'
    },
    {
      id: 'coin_pack_medium',
      name: 'Coin Pack (Medium)',
      description: '1200 Charity Coins + 10% bonus',
      price: 1000,
      currency: 'NGN',
      type: 'coins',
      value: 1320, // includes bonus
      isActive: true,
      category: 'coins'
    },
    {
      id: 'coin_pack_large',
      name: 'Coin Pack (Large)',
      description: '2500 Charity Coins + 25% bonus',
      price: 2000,
      currency: 'NGN',
      type: 'coins',
      value: 3125, // includes bonus
      isActive: true,
      category: 'coins'
    },
    {
      id: 'premium_boost_week',
      name: 'Premium Boost (1 Week)',
      description: 'Priority matching for 7 days',
      price: 300,
      currency: 'NGN',
      type: 'premium_feature',
      value: 7, // days
      isActive: true,
      category: 'boosts'
    },
    {
      id: 'premium_boost_month',
      name: 'Premium Boost (1 Month)',
      description: 'Priority matching for 30 days',
      price: 1000,
      currency: 'NGN',
      type: 'premium_feature',
      value: 30, // days
      isActive: true,
      category: 'boosts'
    },
    {
      id: 'cosmetic_theme_gold',
      name: 'Golden Theme',
      description: 'Exclusive golden app theme',
      price: 800,
      currency: 'NGN',
      type: 'cosmetic',
      value: 365, // days validity
      isActive: true,
      category: 'themes'
    }
  ];

  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionPlans.filter(plan => plan.isActive);
  }

  /**
   * Get subscription plan by ID
   */
  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
    return this.subscriptionPlans.find(plan => plan.id === planId && plan.isActive) || null;
  }

  /**
   * Subscribe user to a plan
   */
  async subscribeUser(userId: string, planId: string, paymentMethod: string): Promise<any> {
    const plan = await this.getSubscriptionPlan(planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gt: new Date() }
      }
    });

    if (existingSubscription) {
      throw new Error('User already has an active subscription');
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (plan.interval === 'yearly' ? 12 : 1));

    // Create subscription record
    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        planId,
        startDate,
        endDate,
        status: 'active',
        paymentMethod,
        amount: plan.price,
        currency: plan.currency
      }
    });

    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionPlan: planId }
    });

    logger.info(`User ${userId} subscribed to plan ${planId}`);
    return subscription;
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gt: new Date() }
      }
    });

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });

    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionPlan: 'basic' }
    });

    logger.info(`User ${userId} cancelled subscription`);
  }

  /**
   * Get user subscription status
   */
  async getUserSubscription(userId: string): Promise<any> {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'active'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!subscription) {
      return {
        plan: 'basic',
        status: 'none',
        features: this.subscriptionPlans.find(p => p.id === 'basic')?.features || []
      };
    }

    const plan = this.subscriptionPlans.find(p => p.id === subscription.planId);
    const isActive = subscription.endDate > new Date();

    return {
      plan: subscription.planId,
      status: isActive ? 'active' : 'expired',
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      features: plan?.features || [],
      autoRenew: subscription.autoRenew
    };
  }

  /**
   * Get all available in-app purchases
   */
  async getInAppPurchases(): Promise<InAppPurchase[]> {
    return this.inAppPurchases.filter(purchase => purchase.isActive);
  }

  /**
   * Process in-app purchase
   */
  async processInAppPurchase(userId: string, purchaseId: string, paymentMethod: string): Promise<any> {
    const purchase = this.inAppPurchases.find(p => p.id === purchaseId && p.isActive);
    if (!purchase) {
      throw new Error('Invalid in-app purchase');
    }

    // Create purchase record
    const purchaseRecord = await prisma.inAppPurchase.create({
      data: {
        userId,
        purchaseId,
        amount: purchase.price,
        currency: purchase.currency,
        paymentMethod,
        status: 'completed'
      }
    });

    // Apply purchase benefits
    if (purchase.type === 'coins') {
      await prisma.coinTransaction.create({
        data: {
          userId,
          amount: purchase.value,
          type: 'purchase',
          reason: `In-app purchase: ${purchase.name}`,
          referenceId: purchaseRecord.id
        }
      });

      // Update user coin balance
      await prisma.user.update({
        where: { id: userId },
        data: { charityCoins: { increment: purchase.value } }
      });
    } else if (purchase.type === 'premium_feature') {
      // Apply premium boost
      const boostEndDate = new Date();
      boostEndDate.setDate(boostEndDate.getDate() + purchase.value);

      await prisma.user.update({
        where: { id: userId },
        data: {
          premiumBoostEndDate: boostEndDate,
          isPremiumBoostActive: true
        }
      });
    } else if (purchase.type === 'cosmetic') {
      // Apply cosmetic item
      await prisma.userCosmetic.create({
        data: {
          userId,
          cosmeticId: purchaseId,
          acquiredAt: new Date(),
          expiresAt: new Date(Date.now() + purchase.value * 24 * 60 * 60 * 1000)
        }
      });
    }

    logger.info(`User ${userId} completed in-app purchase: ${purchaseId}`);
    return purchaseRecord;
  }

  /**
   * Get user purchase history
   */
  async getUserPurchaseHistory(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const offset = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      prisma.inAppPurchase.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.inAppPurchase.count({ where: { userId } })
    ]);

    return {
      purchases: purchases.map(purchase => ({
        ...purchase,
        details: this.inAppPurchases.find(p => p.id === purchase.purchaseId)
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Calculate revenue metrics
   */
  async getRevenueMetrics(startDate: Date, endDate: Date): Promise<any> {
    const subscriptions = await prisma.userSubscription.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'active'
      }
    });

    const purchases = await prisma.inAppPurchase.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'completed'
      }
    });

    const subscriptionRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    const purchaseRevenue = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    const totalRevenue = subscriptionRevenue + purchaseRevenue;

    return {
      period: { startDate, endDate },
      revenue: {
        subscriptions: subscriptionRevenue,
        purchases: purchaseRevenue,
        total: totalRevenue
      },
      transactions: {
        subscriptionCount: subscriptions.length,
        purchaseCount: purchases.length,
        totalCount: subscriptions.length + purchases.length
      },
      averageOrderValue: totalRevenue / (subscriptions.length + purchases.length) || 0
    };
  }

  /**
   * Process subscription renewal
   */
  async processSubscriptionRenewal(userId: string): Promise<void> {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        autoRenew: true,
        endDate: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000) } // Renew within 24 hours
      }
    });

    if (!subscription) return;

    const plan = await this.getSubscriptionPlan(subscription.planId);
    if (!plan) return;

    // Extend subscription
    const newEndDate = new Date(subscription.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + (plan.interval === 'yearly' ? 12 : 1));

    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: { endDate: newEndDate }
    });

    logger.info(`Renewed subscription for user ${userId}`);
  }

  /**
   * Check if user has premium features
   */
  async hasPremiumFeatures(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionPlan: true,
        premiumBoostEndDate: true,
        isPremiumBoostActive: true
      }
    });

    if (!user) return false;

    const hasActiveSubscription = user.subscriptionPlan && user.subscriptionPlan !== 'basic';
    const hasActiveBoost = user.isPremiumBoostActive && user.premiumBoostEndDate && user.premiumBoostEndDate > new Date();

    return hasActiveSubscription || hasActiveBoost || false;
  }
}