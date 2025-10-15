import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Feature Flags Service
 * Enables/disables features without code deployment
 */

// Feature flag names
export enum FeatureFlag {
  DONATIONS = 'donations',
  MARKETPLACE = 'marketplace',
  LEADERBOARD = 'leaderboard',
  REFERRALS = 'referrals',
  DISPUTES = 'disputes',
  COIN_PURCHASES = 'coin_purchases',
  AGENT_NETWORK = 'agent_network',
  KYC_VERIFICATION = 'kyc_verification',
  PUSH_NOTIFICATIONS = 'push_notifications',
  SMS_NOTIFICATIONS = 'sms_notifications',
  EMAIL_NOTIFICATIONS = 'email_notifications',
  FORCE_RECYCLE = 'force_recycle',
  MATCH_EXPIRATION = 'match_expiration',
  ESCROW_RELEASE = 'escrow_release',
}

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(featureName: string): Promise<boolean> {
  try {
    const prisma = (await import('../utils/prisma')).default;
    const featureFlag = await prisma.featureFlag.findUnique({
      where: { featureName }
    });

    const isEnabled = featureFlag?.isEnabled ?? true; // Default to enabled if not found
    logger.debug(`Feature flag check: ${featureName} = ${isEnabled}`);
    return isEnabled;
  } catch (error) {
    logger.error(`Failed to check feature flag ${featureName}:`, error);
    // Fail open - allow feature if check fails
    return true;
  }
}

/**
 * Toggle a feature on/off
 */
export async function toggleFeature(
  featureName: string,
  isEnabled: boolean,
  adminId: string
): Promise<void> {
  const prisma = (await import('../utils/prisma')).default;

  await prisma.featureFlag.upsert({
    where: { featureName },
    update: {
      isEnabled,
      updatedBy: adminId,
      updatedAt: new Date()
    },
    create: {
      featureName,
      isEnabled,
      description: `Feature flag for ${featureName}`,
      updatedBy: adminId
    }
  });

  logger.info(`Feature ${featureName} ${isEnabled ? 'enabled' : 'disabled'} by admin ${adminId}`);
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags() {
  const prisma = (await import('../utils/prisma')).default;
  return await prisma.featureFlag.findMany({
    orderBy: { featureName: 'asc' }
  });
}

/**
 * Initialize default feature flags
 */
export async function initializeFeatureFlags() {
  const prisma = (await import('../utils/prisma')).default;

  const defaultFlags = [
    { featureName: 'donations', description: 'Core donation functionality' },
    { featureName: 'marketplace', description: 'Charity coin marketplace' },
    { featureName: 'leaderboard', description: 'User leaderboards and rankings' },
    { featureName: 'referrals', description: 'Referral program' },
    { featureName: 'disputes', description: 'Dispute resolution system' },
    { featureName: 'coin_purchases', description: 'Coin purchase from agents' },
    { featureName: 'agent_network', description: 'Agent verification network' },
    { featureName: 'kyc_verification', description: 'KYC verification process' },
    { featureName: 'push_notifications', description: 'Push notification system' },
    { featureName: 'sms_notifications', description: 'SMS notification system' },
    { featureName: 'email_notifications', description: 'Email notification system' },
    { featureName: 'force_recycle', description: 'Force recycle feature' },
    { featureName: 'match_expiration', description: 'Match expiration system' },
    { featureName: 'escrow_release', description: 'Escrow release system' },
    // Premium features
    { featureName: 'analytics', description: 'Advanced analytics dashboard' },
    { featureName: 'social_features', description: 'Social circles and posts' },
    { featureName: 'ai_recommendations', description: 'AI-powered recommendations' },
    { featureName: 'crypto_gateways', description: 'Crypto payment gateways' },
    { featureName: 'merchant_services', description: 'Merchant payment services' },
    { featureName: 'corporate_accounts', description: 'Corporate donation accounts' },
    { featureName: 'auction_system', description: 'Advanced auction marketplace' },
    { featureName: 'battle_pass', description: 'Battle pass gamification' },
  ];

  for (const flag of defaultFlags) {
    await prisma.featureFlag.upsert({
      where: { featureName: flag.featureName },
      update: {},
      create: {
        ...flag,
        isEnabled: true,
        updatedBy: 'system'
      }
    });
  }

  logger.info('✅ Feature flags initialized with defaults');
}
