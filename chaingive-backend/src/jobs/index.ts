import Bull from 'bull';
import logger from '../utils/logger';

// Redis configuration
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

// Create job queues
export const escrowQueue = new Bull('escrow-release', redisConfig);
export const matchQueue = new Bull('match-expiration', redisConfig);
export const cycleQueue = new Bull('cycle-reminders', redisConfig);
export const leaderboardQueue = new Bull('leaderboard-update', redisConfig);
export const reportQueue = new Bull('scheduled-reports', redisConfig);
export const coinEscrowQueue = new Bull('coin-escrow-expiration', redisConfig);
export const gamificationQueue = new Bull('gamification-reminders', redisConfig);

// Import job processors
import { processEscrowRelease } from './escrow-release.job';
import { processMatchExpiration } from './match-expiration.job';
import { processCycleReminders } from './cycle-reminders.job';
import { processLeaderboardUpdate } from './leaderboard-update.job';
import { processDailyReport } from './daily-report.job';
import { processWeeklyReport } from './weekly-report.job';
import { processMonthlyDigest } from './monthly-digest.job';
import { processCoinEscrowExpiration } from './coin-escrow-expiration.job';
import { sendMissionReminders, sendStreakAlerts } from './gamification-reminders.job';
import { startSubscriptionRenewalJob } from './subscription-renewal.job';

// Register job processors
escrowQueue.process(processEscrowRelease);
matchQueue.process(processMatchExpiration);
cycleQueue.process(processCycleReminders);
leaderboardQueue.process(processLeaderboardUpdate);
coinEscrowQueue.process(processCoinEscrowExpiration);

// Report queue handles multiple report types
reportQueue.process(async (job) => {
  switch (job.name) {
    case 'daily-report':
      return processDailyReport(job);
    case 'weekly-report':
      return processWeeklyReport(job);
    case 'monthly-digest':
      return processMonthlyDigest(job);
    default:
      logger.warn(`Unknown report job type: ${job.name}`);
  }
});

// Gamification queue handles multiple gamification jobs  
gamificationQueue.process(async (job) => {
  const { processGamificationJob } = await import('./gamification.job');
  return processGamificationJob(job);
});

// Error handling
escrowQueue.on('failed', (job, err) => {
  logger.error(`Escrow job ${job.id} failed:`, err);
});

matchQueue.on('failed', (job, err) => {
  logger.error(`Match job ${job.id} failed:`, err);
});

cycleQueue.on('failed', (job, err) => {
  logger.error(`Cycle job ${job.id} failed:`, err);
});

leaderboardQueue.on('failed', (job, err) => {
  logger.error(`Leaderboard job ${job.id} failed:`, err);
});

reportQueue.on('failed', (job, err) => {
  logger.error(`Report job ${job.id} failed:`, err);
});

coinEscrowQueue.on('failed', (job, err) => {
  logger.error(`Coin escrow job ${job.id} failed:`, err);
});

gamificationQueue.on('failed', (job, err) => {
  logger.error(`Gamification job ${job.id} failed:`, err);
});

// Success logging
escrowQueue.on('completed', (job) => {
  logger.info(`Escrow job ${job.id} completed`);
});

matchQueue.on('completed', (job) => {
  logger.info(`Match job ${job.id} completed`);
});

cycleQueue.on('completed', (job) => {
  logger.info(`Cycle job ${job.id} completed`);
});

leaderboardQueue.on('completed', (job) => {
  logger.info(`Leaderboard job ${job.id} completed`);
});

reportQueue.on('completed', (job) => {
  logger.info(`Report job ${job.id} completed`);
});

coinEscrowQueue.on('completed', (job) => {
  logger.info(`Coin escrow job ${job.id} completed`);
});

gamificationQueue.on('completed', (job) => {
  logger.info(`Gamification job ${job.id} completed`);
});

// Schedule recurring jobs
export function startScheduledJobs() {
  // Escrow releases - check every hour
  escrowQueue.add(
    'release-escrows',
    {},
    {
      repeat: { cron: '0 * * * *' }, // Every hour
      jobId: 'escrow-release-hourly',
    }
  );

  // Match expiration - check every 6 hours
  matchQueue.add(
    'expire-matches',
    {},
    {
      repeat: { cron: '0 */6 * * *' }, // Every 6 hours
      jobId: 'match-expiration-6hourly',
    }
  );

  // Cycle reminders - daily at 9 AM
  cycleQueue.add(
    'send-reminders',
    {},
    {
      repeat: { cron: '0 9 * * *' }, // 9 AM daily
      jobId: 'cycle-reminders-daily',
    }
  );

  // Leaderboard update - daily at midnight
  leaderboardQueue.add(
    'update-leaderboard',
    {},
    {
      repeat: { cron: '0 0 * * *' }, // Midnight daily
      jobId: 'leaderboard-update-daily',
    }
  );

  // Daily report - every morning at 8 AM
  reportQueue.add(
    'daily-report',
    {},
    {
      repeat: { cron: '0 8 * * *' }, // 8 AM daily
      jobId: 'daily-report',
    }
  );

  // Weekly report - every Monday at 9 AM
  reportQueue.add(
    'weekly-report',
    {},
    {
      repeat: { cron: '0 9 * * 1' }, // 9 AM every Monday
      jobId: 'weekly-report',
    }
  );

  // Monthly digest - 1st of each month at 10 AM
  reportQueue.add(
    'monthly-digest',
    {},
    {
      repeat: { cron: '0 10 1 * *' }, // 10 AM on 1st of month
      jobId: 'monthly-digest',
    }
  );

  // Coin escrow expiration - every 10 minutes
  coinEscrowQueue.add(
    'coin-escrow-expiration',
    {},
    {
      repeat: { cron: '*/10 * * * *' }, // Every 10 minutes
      jobId: 'coin-escrow-expiration',
    }
  );

  // ✨ Gamification: Evening mission reminders - 6:00 PM
  gamificationQueue.add(
    'evening-mission-reminders',
    { time: 'evening' },
    {
      repeat: { cron: '0 18 * * *' }, // 6:00 PM daily
      jobId: 'evening-mission-reminders',
    }
  );

  // ✨ Gamification: Night mission reminders - 11:00 PM
  gamificationQueue.add(
    'night-mission-reminders',
    { time: 'night' },
    {
      repeat: { cron: '0 23 * * *' }, // 11:00 PM daily
      jobId: 'night-mission-reminders',
    }
  );

  // ✨ Gamification: Streak protection alerts - 8:00 PM
  gamificationQueue.add(
    'streak-protection-alerts',
    {},
    {
      repeat: { cron: '0 20 * * *' }, // 8:00 PM daily
      jobId: 'streak-protection-alerts',
    }
  );

  // Start subscription renewal jobs
  startSubscriptionRenewalJob();

  logger.info('✅ Scheduled jobs started (including gamification and subscriptions)');
}

export { 
  processEscrowRelease, 
  processMatchExpiration, 
  processCycleReminders, 
  processLeaderboardUpdate,
  processDailyReport,
  processWeeklyReport,
  processMonthlyDigest,
  processCoinEscrowExpiration,
};
