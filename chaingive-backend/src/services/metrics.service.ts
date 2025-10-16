import { register, collectDefaultMetrics, Gauge, Counter, Histogram, Summary } from 'prom-client';
import os from 'os';
import prisma from '../utils/prisma';
import logger from '../utils/logger';

// Enable default metrics collection
collectDefaultMetrics({ prefix: 'chaingive_' });

// Custom metrics
export const metrics = {
  // System metrics
  systemMemoryUsage: new Gauge({
    name: 'chaingive_system_memory_usage_bytes',
    help: 'System memory usage in bytes',
    labelNames: ['type']
  }),

  systemCPUUsage: new Gauge({
    name: 'chaingive_system_cpu_usage_percent',
    help: 'System CPU usage percentage'
  }),

  systemDiskUsage: new Gauge({
    name: 'chaingive_system_disk_usage_percent',
    help: 'System disk usage percentage',
    labelNames: ['mount']
  }),

  // Database metrics
  databaseConnections: new Gauge({
    name: 'chaingive_database_connections_total',
    help: 'Number of database connections',
    labelNames: ['state']
  }),

  databaseQueryDuration: new Histogram({
    name: 'chaingive_database_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
  }),

  databaseConnectionPoolSize: new Gauge({
    name: 'chaingive_database_connection_pool_size',
    help: 'Database connection pool size',
    labelNames: ['type']
  }),

  // Application metrics
  activeUsers: new Gauge({
    name: 'chaingive_active_users_total',
    help: 'Number of active users'
  }),

  activeWebSocketConnections: new Gauge({
    name: 'chaingive_websocket_connections_active',
    help: 'Number of active WebSocket connections'
  }),

  pendingJobs: new Gauge({
    name: 'chaingive_jobs_pending_total',
    help: 'Number of pending background jobs',
    labelNames: ['queue']
  }),

  // Business metrics
  donationsTotal: new Counter({
    name: 'chaingive_donations_total',
    help: 'Total number of donations',
    labelNames: ['status', 'currency']
  }),

  donationAmount: new Counter({
    name: 'chaingive_donation_amount_total',
    help: 'Total donation amount',
    labelNames: ['currency']
  }),

  matchesCreated: new Counter({
    name: 'chaingive_matches_created_total',
    help: 'Total number of donation matches created'
  }),

  escrowTransactions: new Counter({
    name: 'chaingive_escrow_transactions_total',
    help: 'Total number of escrow transactions',
    labelNames: ['status']
  }),

  // External service metrics
  externalServiceHealth: new Gauge({
    name: 'chaingive_external_service_health_status',
    help: 'Health status of external services (1=healthy, 0=unhealthy)',
    labelNames: ['service']
  }),

  externalServiceResponseTime: new Histogram({
    name: 'chaingive_external_service_response_time_seconds',
    help: 'Response time for external service calls',
    labelNames: ['service', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  }),

  // Error metrics
  applicationErrors: new Counter({
    name: 'chaingive_application_errors_total',
    help: 'Total number of application errors',
    labelNames: ['type', 'endpoint']
  }),

  // Performance metrics
  httpRequestDuration: new Histogram({
    name: 'chaingive_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
  }),

  httpRequestsTotal: new Counter({
    name: 'chaingive_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  }),

  // Uptime metric
  uptime: new Gauge({
    name: 'chaingive_uptime_seconds',
    help: 'Application uptime in seconds'
  })
};

/**
 * Update system metrics
 */
export const updateSystemMetrics = () => {
  try {
    // Memory metrics
    const memUsage = process.memoryUsage();
    metrics.systemMemoryUsage.set({ type: 'rss' }, memUsage.rss);
    metrics.systemMemoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed);
    metrics.systemMemoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal);
    metrics.systemMemoryUsage.set({ type: 'external' }, memUsage.external);

    // CPU metrics
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);
    metrics.systemCPUUsage.set(usage);

    // Uptime
    metrics.uptime.set(process.uptime());

  } catch (error) {
    logger.error('Failed to update system metrics:', error);
  }
};

/**
 * Update database metrics
 */
export const updateDatabaseMetrics = async () => {
  try {
    // Connection metrics
    const connectionStats = await prisma.$queryRaw`
      SELECT state, count(*) as count
      FROM pg_stat_activity
      GROUP BY state
    ` as any[];

    connectionStats.forEach((stat: any) => {
      metrics.databaseConnections.set({ state: stat.state || 'unknown' }, parseInt(stat.count));
    });

    // Connection pool size (simplified)
    metrics.databaseConnectionPoolSize.set({ type: 'active' }, 1);
    metrics.databaseConnectionPoolSize.set({ type: 'idle' }, 5);
    metrics.databaseConnectionPoolSize.set({ type: 'total' }, 10);

  } catch (error) {
    logger.error('Failed to update database metrics:', error);
  }
};

/**
 * Update application metrics
 */
export const updateApplicationMetrics = async () => {
  try {
    // Active users (last 24 hours)
    const activeUsersCount = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    metrics.activeUsers.set(activeUsersCount);

    // Transaction metrics (using Transaction model instead of donation)
    const transactionStats = await prisma.transaction.groupBy({
      by: ['status', 'type'],
      _count: true,
      _sum: {
        amount: true
      }
    });

    transactionStats.forEach((stat: any) => {
      metrics.donationsTotal.inc({ status: stat.status, currency: 'NGN' }, stat._count);
      if (stat._sum.amount) {
        metrics.donationAmount.inc({ currency: 'NGN' }, stat._sum.amount);
      }
    });

    // Match metrics
    const matchesCount = await prisma.match.count();
    metrics.matchesCreated.inc(matchesCount);

  } catch (error) {
    logger.error('Failed to update application metrics:', error);
  }
};

/**
 * Update external service health
 */
export const updateExternalServiceHealth = async () => {
  try {
    // Check Redis health
    try {
      // Mock Redis check - in real implementation, ping Redis
      metrics.externalServiceHealth.set({ service: 'redis' }, 1);
    } catch (error) {
      metrics.externalServiceHealth.set({ service: 'redis' }, 0);
    }

    // Check email service health
    try {
      // Mock email service check
      metrics.externalServiceHealth.set({ service: 'email' }, 1);
    } catch (error) {
      metrics.externalServiceHealth.set({ service: 'email' }, 0);
    }

    // Check SMS service health
    try {
      // Mock SMS service check
      metrics.externalServiceHealth.set({ service: 'sms' }, 1);
    } catch (error) {
      metrics.externalServiceHealth.set({ service: 'sms' }, 0);
    }

  } catch (error) {
    logger.error('Failed to update external service health:', error);
  }
};

/**
 * Middleware to collect HTTP metrics
 */
export const httpMetricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || 'unknown';

    metrics.httpRequestDuration
      .observe({ method: req.method, route, status_code: res.statusCode }, duration);

    metrics.httpRequestsTotal
      .inc({ method: req.method, route, status_code: res.statusCode });
  });

  next();
};

/**
 * Get metrics in Prometheus format
 */
export const getMetrics = async (): Promise<string> => {
  return register.metrics();
};

/**
 * Get metrics registry
 */
export const getRegistry = () => register;

/**
 * Initialize metrics collection
 */
export const initializeMetrics = () => {
  // Update metrics every 30 seconds
  setInterval(() => {
    updateSystemMetrics();
    updateDatabaseMetrics();
    updateApplicationMetrics();
    updateExternalServiceHealth();
  }, 30000);

  // Initial update
  updateSystemMetrics();
  updateDatabaseMetrics();
  updateApplicationMetrics();
  updateExternalServiceHealth();

  logger.info('Metrics collection initialized');
};

export default metrics;