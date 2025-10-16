import { Job } from 'bull';
import logger from '../utils/logger';
import { recalculateAllLeaderboards, expireOldBoosts } from '../services/leaderboard.service';
import realtimeService from '../services/realtime.service';

/**
 * Update leaderboard rankings
 * Runs: Daily at midnight
 */
export async function processLeaderboardUpdate(job: Job) {
  logger.info('Starting leaderboard update job...');

  try {
    // Step 1: Expire old boosts
    await expireOldBoosts();

    // Step 2: Recalculate all scores and ranks
    await recalculateAllLeaderboards();

    // Step 3: Send real-time notifications for leaderboard changes
    // Note: We broadcast to all users since leaderboard affects everyone
    await realtimeService.notifyLeaderboardUpdated([]);

    logger.info('Leaderboard update job completed successfully');

    return { success: true };
  } catch (error) {
    logger.error('Leaderboard update job failed:', error);
    throw error;
  }
}
