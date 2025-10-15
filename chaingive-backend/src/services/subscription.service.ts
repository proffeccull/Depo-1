import { PrismaClient } from '@prisma/client';
import { addMonths, addDays } from 'date-fns';

const prisma = new PrismaClient();

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceCoins: number;
  features: Record<string, any>;
  coinMultiplier: number;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateSubscriptionData {
  userId: string;
  planId: string;
  autoRenew?: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan?: SubscriptionPlan;
  subscription?: any;
  daysRemaining?: number;
}

class SubscriptionService {
  async getPlans(): Promise<SubscriptionPlan[]> {
    return await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    return await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });
  }

  async getUserSubscription(userId: string) {
    return await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['active', 'grace_period'] }
      },
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      return { isActive: false };
    }

    const now = new Date();
    const isActive = subscription.status === 'active' && subscription.currentPeriodEnd > now;
    const daysRemaining = Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isActive,
      plan: subscription.plan,
      subscription,
      daysRemaining: Math.max(0, daysRemaining)
    };
  }

  async subscribe(data: CreateSubscriptionData) {
    const { userId, planId, autoRenew = true } = data;

    // Check if user has sufficient coins
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    if (user.charityCoinsBalance < plan.priceCoins) {
      throw new Error('Insufficient coins');
    }

    // Check for existing active subscription
    const existingSubscription = await this.getUserSubscription(userId);
    if (existingSubscription) {
      throw new Error('User already has an active subscription');
    }

    const now = new Date();
    const periodEnd = addMonths(now, 1);

    return await prisma.$transaction(async (tx) => {
      // Deduct coins
      await tx.user.update({
        where: { id: userId },
        data: {
          charityCoinsBalance: {
            decrement: plan.priceCoins
          }
        }
      });

      // Create subscription
      const subscription = await tx.subscription.create({
        data: {
          userId,
          planId,
          status: 'active',
          autoRenew,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          lastPaymentCoins: plan.priceCoins,
          lastPaymentAt: now,
          nextPaymentDue: autoRenew ? periodEnd : null
        },
        include: {
          plan: true
        }
      });

      // Log subscription history
      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          action: 'subscribed',
          planName: plan.name,
          coinsCharged: plan.priceCoins,
          newStatus: 'active'
        }
      });

      return subscription;
    });
  }

  async renewSubscription(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, user: true }
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.user.charityCoinsBalance < subscription.plan.priceCoins) {
      // Enter grace period
      const gracePeriodEnd = addDays(subscription.currentPeriodEnd, 7);
      
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'grace_period',
          gracePeriodEnd
        }
      });

      throw new Error('Insufficient coins for renewal - entered grace period');
    }

    const newPeriodEnd = addMonths(subscription.currentPeriodEnd, 1);

    return await prisma.$transaction(async (tx) => {
      // Deduct coins
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          charityCoinsBalance: {
            decrement: subscription.plan.priceCoins
          }
        }
      });

      // Update subscription
      const updatedSubscription = await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'active',
          currentPeriodStart: subscription.currentPeriodEnd,
          currentPeriodEnd: newPeriodEnd,
          lastPaymentCoins: subscription.plan.priceCoins,
          lastPaymentAt: new Date(),
          nextPaymentDue: subscription.autoRenew ? newPeriodEnd : null,
          gracePeriodEnd: null
        },
        include: { plan: true }
      });

      // Log renewal
      await tx.subscriptionHistory.create({
        data: {
          subscriptionId,
          action: 'renewed',
          planName: subscription.plan.name,
          coinsCharged: subscription.plan.priceCoins,
          previousStatus: subscription.status,
          newStatus: 'active'
        }
      });

      return updatedSubscription;
    });
  }

  async cancelSubscription(subscriptionId: string, reason?: string) {
    return await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          autoRenew: false,
          cancelledAt: new Date(),
          cancellationReason: reason,
          nextPaymentDue: null
        },
        include: { plan: true }
      });

      await tx.subscriptionHistory.create({
        data: {
          subscriptionId,
          action: 'cancelled',
          planName: subscription.plan.name,
          previousStatus: subscription.status,
          newStatus: subscription.status,
          reason
        }
      });

      return subscription;
    });
  }

  async getSubscriptionHistory(userId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
        history: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return subscriptions;
  }

  async processRenewals() {
    const now = new Date();
    
    // Find subscriptions due for renewal
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        autoRenew: true,
        nextPaymentDue: {
          lte: now
        }
      },
      include: { plan: true, user: true }
    });

    const results = [];
    
    for (const subscription of dueSubscriptions) {
      try {
        const renewed = await this.renewSubscription(subscription.id);
        results.push({ success: true, subscriptionId: subscription.id, renewed });
      } catch (error) {
        results.push({ 
          success: false, 
          subscriptionId: subscription.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return results;
  }

  async expireGracePeriods() {
    const now = new Date();
    
    const expiredSubscriptions = await prisma.subscription.updateMany({
      where: {
        status: 'grace_period',
        gracePeriodEnd: {
          lte: now
        }
      },
      data: {
        status: 'expired'
      }
    });

    return expiredSubscriptions;
  }
}

export const subscriptionService = new SubscriptionService();