import cron from 'node-cron';
import { subscriptionService } from '../services/subscription.service';
import logger from '../utils/logger';

export const startSubscriptionRenewalJob = () => {
  // Run every hour to check for renewals
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Starting subscription renewal job...');
      
      const results = await subscriptionService.processRenewals();
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      logger.info(`Subscription renewal job completed: ${successful} successful, ${failed} failed`);
      
      if (failed > 0) {
        logger.warn('Some subscription renewals failed:', results.filter(r => !r.success));
      }
    } catch (error) {
      logger.error('Subscription renewal job failed:', error);
    }
  });

  // Run daily to expire grace periods
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Starting grace period expiration job...');
      
      const result = await subscriptionService.expireGracePeriods();
      
      logger.info(`Grace period expiration job completed: ${result.count} subscriptions expired`);
    } catch (error) {
      logger.error('Grace period expiration job failed:', error);
    }
  });

  logger.info('📅 Subscription renewal jobs scheduled');
};