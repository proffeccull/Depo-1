import { Job } from 'bull';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { sendTemplateNotification } from '../services/notification.service';

/**
 * Expire old matches (24-hour window)
 * Runs: Every 6 hours
 */
export async function processMatchExpiration(job: Job) {
  logger.info('Starting match expiration job...');

  try {
    // Find all expired matches
    const result = await prisma.match.updateMany({
      where: {
        status: 'pending',
        expiresAt: {
          not: null,
          lt: new Date(),
        },
      },
      data: {
        status: 'expired',
      },
    });

    logger.info(`Expired ${result.count} matches`);

    // TODO: Notify donors their matches expired (requires notification service integration)
    // They can create a new donation

    return { expired: result.count };
  } catch (error) {
    logger.error('Match expiration job failed:', error);
    throw error;
  }
}
