import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SENTRY_DSN'
];

function validateEnv() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}

export { validateEnv };