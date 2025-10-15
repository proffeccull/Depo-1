import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription.service';

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await subscriptionService.getPlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const status = await subscriptionService.getSubscriptionStatus(userId);
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const subscribe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { planId, autoRenew } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    const subscription = await subscriptionService.subscribe({
      userId,
      planId,
      autoRenew
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to plan',
      data: subscription
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('Insufficient coins') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { reason } = req.body;

    // Get user's active subscription
    const activeSubscription = await subscriptionService.getUserSubscription(userId);
    if (!activeSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    const subscription = await subscriptionService.cancelSubscription(activeSubscription.id, reason);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateAutoRenew = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { autoRenew } = req.body;

    if (typeof autoRenew !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'autoRenew must be a boolean'
      });
    }

    // Get user's active subscription
    const activeSubscription = await subscriptionService.getUserSubscription(userId);
    if (!activeSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Update auto-renewal setting
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const updatedSubscription = await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: { 
        autoRenew,
        nextPaymentDue: autoRenew ? activeSubscription.currentPeriodEnd : null
      },
      include: { plan: true }
    });

    res.json({
      success: true,
      message: 'Auto-renewal setting updated',
      data: updatedSubscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update auto-renewal setting',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSubscriptionHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const history = await subscriptionService.getSubscriptionHistory(userId);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const renewSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user's subscription
    const activeSubscription = await subscriptionService.getUserSubscription(userId);
    if (!activeSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    const subscription = await subscriptionService.renewSubscription(activeSubscription.id);

    res.json({
      success: true,
      message: 'Subscription renewed successfully',
      data: subscription
    });
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('Insufficient coins') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to renew subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};