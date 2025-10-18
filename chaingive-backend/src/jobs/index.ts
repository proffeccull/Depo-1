import Bull from 'bull';
import logger from '../utils/logger';

// Redis configuration (optional - will work without Redis)
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

// Create job queues (with error handling for Redis)
let escrowQueue: Bull.Queue;
let matchQueue: Bull.Queue;
let cycleQueue: Bull.Queue;
let leaderboardQueue: Bull.Queue;
let reportQueue: Bull.Queue;
let coinEscrowQueue: Bull.Queue;
let gamificationQueue: Bull.Queue;

try {
  escrowQueue = new Bull('escrow-release', redisConfig);
  matchQueue = new Bull('match-expiration', redisConfig);
  cycleQueue = new Bull('cycle-reminders', redisConfig);
  leaderboardQueue = new Bull('leaderboard-update', redisConfig);
  reportQueue = new Bull('scheduled-reports', redisConfig);
  coinEscrowQueue = new Bull('coin-escrow-expiration', redisConfig);
  gamificationQueue = new Bull('gamification-reminders', redisConfig);

  logger.info('✅ Job queues initialized with Redis');
} catch (error) {
  logger.warn('Redis not available for job queues, using memory fallback');
  // Create queues without Redis config for memory-only operation
  escrowQueue = new Bull('escrow-release');
  matchQueue = new Bull('match-expiration');
  cycleQueue = new Bull('cycle-reminders');
  leaderboardQueue = new Bull('leaderboard-update');
  reportQueue = new Bull('scheduled-reports');
  coinEscrowQueue = new Bull('coin-escrow-expiration');
  gamificationQueue = new Bull('gamification-reminders');
}