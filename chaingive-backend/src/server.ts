import './instrument';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter, authLimiter } from './middleware/rateLimiter';
import { sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './middleware/sentryHandler';
import logger from './utils/logger';
import { startScheduledJobs } from './jobs';
import { initializeSentry } from './services/sentry.service';
import websocketService from './services/websocket.service';
import { swaggerUi, specs } from './utils/swagger';
import { initializeMetrics, httpMetricsMiddleware } from './services/metrics.service';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import walletRoutes from './routes/wallet.routes';
import donationRoutes from './routes/donation.routes';
import cycleRoutes from './routes/cycle.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import marketplaceAdminRoutes from './routes/marketplaceAdmin.routes';
import agentRoutes from './routes/agent.routes';
import agentCoinRoutes from './routes/agentCoin.routes';
import adminCoinRoutes from './routes/adminCoin.routes';
import adminRoutes from './routes/admin.routes';
import adminAdvancedRoutes from './routes/adminAdvanced.routes';
import adminGodModeRoutes from './routes/adminGodMode.routes';
import adminSystemRoutes from './routes/adminSystem.routes';
import adminAuthRoutes from './routes/adminAuth.routes';
import matchRoutes from './routes/match.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import notificationRoutes from './routes/notification.routes';
import uploadRoutes from './routes/upload.routes';
import referralRoutes from './routes/referral.routes';
import disputeRoutes from './routes/dispute.routes';
import coinPurchaseRoutes from './routes/coinPurchase.routes';
import subscriptionRoutes from './routes/subscription.routes';
import proposalRoutes from './routes/proposal.routes';
import blockchainRoutes from './routes/blockchain.routes';

// Premium Feature Routes
import analyticsRoutes from './routes/analytics.routes';
import socialRoutes from './routes/social.routes';
import aiRoutes from './routes/ai.routes';
import cryptoGatewayRoutes from './routes/cryptoGateway.routes';
import merchantRoutes from './routes/merchant.routes';
import corporateRoutes from './routes/corporate.routes';
import gamificationRoutes from './routes/gamification.routes';
import gamificationAdminRoutes from './routes/gamificationAdmin.routes';
import fundraisingRoutes from './routes/fundraising.routes';
import cryptoPaymentRoutes from './routes/cryptoPayment.routes';
import syncRoutes from './routes/sync.routes';
import recurringDonationRoutes from './routes/recurring-donation.routes';
import analyticsDashboardRoutes from './routes/analytics-dashboard.routes';
import communityRoutes from './routes/community.routes';
import webhooksRoutes from './routes/webhooks.routes';
import http3Service from './services/http3.service';

// Load environment variables
dotenv.config();

// Validate required environment variables
import { validateEnv } from './config/env';
validateEnv();

// Initialize Sentry (must be before Express app)
initializeSentry();

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
const API_VERSION = process.env.API_VERSION || 'v2';

// Sentry request handler (must be first middleware)
app.use(sentryRequestHandler);
app.use(sentryTracingHandler);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
app.use(rateLimiter);

// HTTP Metrics middleware
app.use(httpMetricsMiddleware);

// Health check
app.get(['/','/health'], (req, res) => {
  const http3Status = http3Service.getStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    protocols: {
      http1: true,
      http2: http3Status.protocol === 'HTTP/2',
      http3: http3Status.enabled,
    },
  });
});
app.head(['/','/health'], (_req, res) => res.sendStatus(200));

// Swagger documentation
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  logger.info('📚 Swagger docs available at http://localhost:' + PORT + '/api-docs');
}

// API Routes
app.use(`/${API_VERSION}/auth`, authRoutes);
app.use(`/${API_VERSION}/users`, userRoutes);
app.use(`/${API_VERSION}/wallet`, walletRoutes);
app.use(`/${API_VERSION}/donations`, donationRoutes);
app.use(`/${API_VERSION}/cycles`, cycleRoutes);
app.use(`/${API_VERSION}/marketplace`, marketplaceRoutes);
app.use(`/${API_VERSION}/admin/marketplace`, marketplaceAdminRoutes);
app.use(`/${API_VERSION}/agents`, agentRoutes);
app.use(`/${API_VERSION}/agents`, agentCoinRoutes); // Agent coin management
app.use(`/${API_VERSION}/admin/coins`, adminCoinRoutes); // Admin coin management
app.use(`/${API_VERSION}/admin/advanced`, adminAdvancedRoutes); // Admin advanced features
app.use(`/${API_VERSION}/admin/godmode`, adminGodModeRoutes); // God mode admin features
app.use(`/${API_VERSION}/admin/system`, adminSystemRoutes); // System monitoring
app.use(`/${API_VERSION}/admin`, adminRoutes); // Admin general management
app.use(`/${API_VERSION}/admin/auth`, adminAuthRoutes); // Admin authentication with MFA
app.use(`/${API_VERSION}/matches`, matchRoutes);
app.use(`/${API_VERSION}/leaderboard`, leaderboardRoutes);
app.use(`/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/${API_VERSION}/upload`, uploadRoutes);
app.use(`/${API_VERSION}/referrals`, referralRoutes);
app.use(`/${API_VERSION}/disputes`, disputeRoutes);
app.use(`/${API_VERSION}/coins/purchase`, coinPurchaseRoutes);
app.use(`/${API_VERSION}/subscriptions`, subscriptionRoutes);

// Premium Feature Routes
app.use(`/${API_VERSION}/analytics`, analyticsRoutes);
app.use(`/${API_VERSION}/social`, socialRoutes);
app.use(`/${API_VERSION}/ai`, aiRoutes);
app.use(`/${API_VERSION}/crypto`, cryptoGatewayRoutes);
app.use(`/${API_VERSION}/merchants`, merchantRoutes);
app.use(`/${API_VERSION}/corporate`, corporateRoutes);
app.use(`/${API_VERSION}/gamification`, gamificationRoutes);
app.use(`/${API_VERSION}/gamification/admin`, gamificationAdminRoutes);
app.use(`/${API_VERSION}/fundraising`, fundraisingRoutes);
app.use(`/${API_VERSION}/recurring-donations`, recurringDonationRoutes);
app.use(`/${API_VERSION}/analytics/dashboard`, analyticsDashboardRoutes);
app.use(`/${API_VERSION}`, cryptoPaymentRoutes);
// Community Routes
app.use(`/${API_VERSION}/community`, communityRoutes);
app.use(`/${API_VERSION}`, syncRoutes);

// Blockchain Routes
app.use(`/${API_VERSION}/blockchain`, blockchainRoutes);

// Webhook Routes (no auth required)
app.use('/webhooks', webhooksRoutes);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const { getMetrics } = await import('./services/metrics.service');
    const metrics = await getMetrics();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    res.status(500).send('Error generating metrics');
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Error handling (Sentry must be before other error handlers)
app.use(sentryErrorHandler);
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize metrics collection
initializeMetrics();
logger.info('📊 Metrics collection initialized');

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 ChainGive API Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API Version: ${API_VERSION}`);
  logger.info(`🌍 Health check: http://localhost:${PORT}/health`);
  logger.info(`📈 Prometheus metrics: http://localhost:${PORT}/metrics`);

  // Initialize WebSocket server
  websocketService.initialize(server);
  logger.info('🔌 WebSocket server initialized');

  // Initialize HTTP/3 server
  http3Service.initialize(app);

  // Start background jobs
  if (process.env.NODE_ENV !== 'test') {
    startScheduledJobs();
    logger.info('⏰ Background jobs scheduled');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    websocketService.shutdown();
    http3Service.shutdown();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    websocketService.shutdown();
    http3Service.shutdown();
    process.exit(0);
  });
});

export default app;
