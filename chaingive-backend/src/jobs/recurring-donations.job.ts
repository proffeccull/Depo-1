import cron from 'node-cron';
import recurringDonationService from '../services/recurring-donation.service';
import logger from '../utils/logger';

export function startRecurringDonationsJob() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Processing recurring donations...');
    try {
      await recurringDonationService.processDue();
      logger.info('Recurring donations processed successfully');
    } catch (error) {
      logger.error('Error processing recurring donations:', error);
    }
  });

  logger.info('Recurring donations job scheduled');
}
