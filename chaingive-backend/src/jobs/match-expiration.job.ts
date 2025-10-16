import { Job } from 'bull';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { sendTemplateNotification } from '../services/notification.service';
import realtimeService from '../services/realtime.service';

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

    // Notify affected donors and recipients about expired matches
    if (result.count > 0) {
      const expiredMatches = await prisma.match.findMany({
        where: {
          status: 'expired',
        },
        include: {
          donor: { select: { id: true } },
          recipient: { select: { id: true } },
        },
        take: result.count, // Limit to the number we just expired
      });

      for (const match of expiredMatches) {
        try {
          await realtimeService.notifyDonationDefaulted(
            match.donorId,
            match.recipientId,
            {
              id: match.id,
              amount: match.amount,
            }
          );

          // Send push notification
          await sendTemplateNotification(
            match.donorId,
            'MATCH_EXPIRED',
            match.amount
          );
        } catch (error) {
          logger.warn(`Failed to notify about expired match ${match.id}:`, error);
        }
      }
    }

    return { expired: result.count };
  } catch (error) {
    logger.error('Match expiration job failed:', error);
    throw error;
  }
}
