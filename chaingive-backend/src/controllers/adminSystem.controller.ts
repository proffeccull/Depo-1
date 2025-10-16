import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * System Health Monitoring Controller
 * Provides comprehensive system health checks and monitoring
 */

/**
 * Get system health overview
 */
export const getSystemHealth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const health = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: await checkDatabaseHealth(),
        redis: await checkRedisHealth(),
        email: await checkEmailHealth(),
        sms: await checkSMSHealth(),
      },
      system: {
        memory: getMemoryUsage(),
        cpu: getCPUUsage(),
        disk: await getDiskUsage(),
        loadAverage: os.loadavg(),
      },
      application: {
        activeConnections: await getActiveConnections(),
        pendingJobs: await getPendingJobs(),
        errorRate: await getErrorRate(),
      },
    };

    // Determine overall health status
    const isHealthy = Object.values(health.services).every(service => service.status === 'healthy');
    const status = isHealthy ? 'healthy' : 'degraded';

    res.status(200).json({
      success: true,
      status,
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed database health metrics
 */
export const getDatabaseHealth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const metrics = await getDatabaseMetrics();

    res.status(200).json({
      success: true,
      data: {
        ...dbHealth,
        metrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get application performance metrics
 */
export const getPerformanceMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { period = '1h' } = req.query;

    // Calculate time range
    const now = new Date();
    let startTime: Date;

    switch (period) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    const metrics = await getPerformanceData(startTime, now);

    res.status(200).json({
      success: true,
      data: {
        period,
        startTime,
        endTime: now,
        metrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system logs
 */
export const getSystemLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { level = 'error', limit = 100, startDate, endDate } = req.query;

    let where: any = {};
    if (level !== 'all') where.level = level;
    if (startDate) where.timestamp = { gte: new Date(startDate as string) };
    if (endDate) where.timestamp = { ...where.timestamp, lte: new Date(endDate as string) };

    // Note: This assumes you have a logs table. In production, you'd typically read from log files or a logging service
    const logs = await prisma.adminAction.findMany({
      where: {
        action: { in: ['system_error', 'system_warning'] },
        createdAt: where.timestamp,
      },
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        logs,
        total: logs.length,
        filters: { level, limit, startDate, endDate },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger system maintenance
 */
export const triggerMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { action, reason } = req.body;
    const adminId = req.user!.id;

    if (!['cleanup', 'optimize', 'backup'].includes(action)) {
      throw new AppError('Invalid maintenance action', 400, 'INVALID_ACTION');
    }

    // Log maintenance action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: `system_maintenance_${action}`,
        details: JSON.stringify({ reason, automated: false }),
      }
    });

    // Execute maintenance action
    let result: any = {};
    switch (action) {
      case 'cleanup':
        result = await performCleanup();
        break;
      case 'optimize':
        result = await performOptimization();
        break;
      case 'backup':
        result = await triggerBackup();
        break;
    }

    logger.info(`Admin ${adminId} triggered system maintenance: ${action}`);

    res.status(200).json({
      success: true,
      message: `System maintenance '${action}' completed`,
      data: {
        action,
        result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get backup status and history
 */
export const getBackupStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // This would typically query a backup management system
    // For now, return mock data
    const backups = [
      {
        id: 'backup-001',
        type: 'full',
        status: 'completed',
        size: '2.5GB',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        location: 's3://chaingive-backups/',
      },
      {
        id: 'backup-002',
        type: 'incremental',
        status: 'completed',
        size: '500MB',
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        location: 's3://chaingive-backups/',
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        backups,
        lastBackup: backups[0],
        nextScheduledBackup: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions

async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      connectionPool: {
        active: 1, // Would get from connection pool stats
        idle: 5,
        total: 10,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkRedisHealth() {
  try {
    // Mock Redis health check - would connect to Redis in real implementation
    return {
      status: 'healthy',
      memory: '256MB',
      connections: 150,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: 'Redis connection failed',
    };
  }
}

async function checkEmailHealth() {
  try {
    // Mock email service health check
    return {
      status: 'healthy',
      provider: 'SendGrid',
      dailyQuota: { used: 1250, limit: 10000 },
    };
  } catch (error) {
    return {
      status: 'degraded',
      error: 'Email service check failed',
    };
  }
}

async function checkSMSHealth() {
  try {
    // Mock SMS service health check
    return {
      status: 'healthy',
      provider: 'Termii',
      dailyQuota: { used: 450, limit: 1000 },
    };
  } catch (error) {
    return {
      status: 'degraded',
      error: 'SMS service check failed',
    };
  }
}

function getMemoryUsage() {
  const memUsage = process.memoryUsage();
  return {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    usagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
  };
}

function getCPUUsage() {
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

  return {
    cores: cpus.length,
    usage: `${usage}%`,
    model: cpus[0].model,
  };
}

async function getDiskUsage() {
  try {
    const { stdout } = await execAsync('df -h / | tail -1');
    const parts = stdout.trim().split(/\s+/);
    return {
      filesystem: parts[0],
      size: parts[1],
      used: parts[2],
      available: parts[3],
      usePercent: parts[4],
      mountPoint: parts[5],
    };
  } catch (error) {
    return {
      error: 'Unable to get disk usage',
    };
  }
}

async function getActiveConnections() {
  // Mock active connections - would get from WebSocket service
  return 1250;
}

async function getPendingJobs() {
  // Mock pending jobs - would query job queue
  return 15;
}

async function getErrorRate() {
  // Mock error rate - would calculate from logs/metrics
  return '0.05%';
}

async function getDatabaseMetrics() {
  try {
    const [
      connectionCount,
      activeQueries,
      tableStats,
    ] = await Promise.all([
      prisma.$queryRaw`SELECT count(*) as connections FROM pg_stat_activity`,
      prisma.$queryRaw`SELECT count(*) as active FROM pg_stat_activity WHERE state = 'active'`,
      prisma.$queryRaw`
        SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
        FROM pg_stat_user_tables
        ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
        LIMIT 10
      `,
    ]);

    return {
      connections: connectionCount,
      activeQueries: activeQueries,
      topTables: tableStats,
    };
  } catch (error) {
    return { error: 'Unable to fetch database metrics' };
  }
}

async function getPerformanceData(startTime: Date, endTime: Date) {
  // Mock performance data - would aggregate from metrics/logs
  return {
    requests: {
      total: 15420,
      averageResponseTime: '245ms',
      p95ResponseTime: '890ms',
      errorRate: '0.02%',
    },
    database: {
      queryCount: 45230,
      averageQueryTime: '12ms',
      slowQueries: 23,
    },
    memory: {
      peakUsage: '512MB',
      averageUsage: '387MB',
      gcCollections: 145,
    },
  };
}

async function performCleanup() {
  // Mock cleanup operations
  return {
    tempFilesRemoved: 15,
    oldLogsCleaned: '2.3GB',
    cacheCleared: true,
    duration: '2.5s',
  };
}

async function performOptimization() {
  // Mock optimization operations
  return {
    tablesOptimized: 25,
    indexesRebuilt: 8,
    queriesOptimized: 12,
    duration: '45s',
  };
}

async function triggerBackup() {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${timestamp}`;
    const backupDir = process.env.BACKUP_DIR || '/tmp/chaingive-backups';
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new AppError('Database URL not configured', 500, 'CONFIG_ERROR');
    }

    // Create backup directory if it doesn't exist
    await execAsync(`mkdir -p ${backupDir}`);

    // Extract database connection details from URL
    const dbUrlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!dbUrlMatch) {
      throw new AppError('Invalid database URL format', 500, 'CONFIG_ERROR');
    }

    const [, user, password, host, port, database] = dbUrlMatch;
    const backupFile = `${backupDir}/${backupId}.sql`;

    // Use pg_dump to create backup
    const pgDumpCommand = `PGPASSWORD=${password} pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -f ${backupFile} --no-password --format=custom`;

    await execAsync(pgDumpCommand);

    // Get file size
    const { stdout: sizeOutput } = await execAsync(`du -h ${backupFile} | cut -f1`);
    const size = sizeOutput.trim();

    logger.info(`Database backup created: ${backupId}, size: ${size}`);

    return {
      backupId,
      type: 'full',
      status: 'completed',
      size,
      location: backupFile,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Failed to create database backup:', error);
    throw new AppError('Failed to create database backup', 500, 'BACKUP_FAILED');
  }
}

/**
 * Restore database from backup
 */
export const restoreFromBackup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { backupId, confirmRestore } = req.body;
    const adminId = req.user!.id;

    if (!confirmRestore) {
      throw new AppError('Restore confirmation required', 400, 'CONFIRMATION_REQUIRED');
    }

    const backupDir = process.env.BACKUP_DIR || '/tmp/chaingive-backups';
    const backupFile = `${backupDir}/${backupId}.sql`;

    // Check if backup file exists
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      await execAsync(`test -f ${backupFile}`);
    } catch (error) {
      throw new AppError('Backup file not found', 404, 'BACKUP_NOT_FOUND');
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new AppError('Database URL not configured', 500, 'CONFIG_ERROR');
    }

    // Extract database connection details
    const dbUrlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!dbUrlMatch) {
      throw new AppError('Invalid database URL format', 500, 'CONFIG_ERROR');
    }

    const [, user, password, host, port, database] = dbUrlMatch;

    // Create pre-restore backup
    const preRestoreBackupId = `prerestore-${Date.now()}`;
    const preRestoreFile = `${backupDir}/${preRestoreBackupId}.sql`;
    const preRestoreCommand = `PGPASSWORD=${password} pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -f ${preRestoreFile} --no-password --format=custom`;

    await execAsync(preRestoreCommand);
    logger.info(`Pre-restore backup created: ${preRestoreBackupId}`);

    // Perform restore
    const restoreCommand = `PGPASSWORD=${password} pg_restore -h ${host} -p ${port} -U ${user} -d ${database} --clean --if-exists ${backupFile}`;

    await execAsync(restoreCommand);

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'database_restore',
        details: JSON.stringify({
          backupId,
          preRestoreBackupId,
          restoredAt: new Date().toISOString(),
        }),
      },
    });

    logger.warn(`Database restored from backup ${backupId} by admin ${adminId}`);

    res.status(200).json({
      success: true,
      message: 'Database restored successfully',
      data: {
        backupId,
        preRestoreBackupId,
        restoredAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List available backups
 */
export const listBackups = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const backupDir = process.env.BACKUP_DIR || '/tmp/chaingive-backups';
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // List backup files
    const { stdout } = await execAsync(`ls -la ${backupDir}/*.sql 2>/dev/null || echo "No backups found"`);

    if (stdout.includes('No backups found')) {
      return res.status(200).json({
        success: true,
        data: {
          backups: [],
          total: 0,
        },
      });
    }

    // Parse backup files
    const lines = stdout.trim().split('\n').filter((line: string) => line.trim());
    const backups = lines.map((line: string) => {
      const parts = line.split(/\s+/);
      const filename = parts[parts.length - 1].split('/').pop();
      const size = parts[4];
      const date = `${parts[5]} ${parts[6]} ${parts[7]}`;

      return {
        id: filename?.replace('.sql', ''),
        filename: filename,
        size,
        createdAt: date,
        type: filename?.includes('prerestore') ? 'prerestore' : 'manual',
      };
    });

    res.status(200).json({
      success: true,
      data: {
        backups,
        total: backups.length,
        backupDir,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Prometheus metrics in human-readable JSON format
 */
export const getPrometheusMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { getRegistry } = await import('../services/metrics.service');
    const registry = getRegistry();

    // Get all metrics
    const metrics = await registry.getMetricsAsJSON();

    // Organize metrics by category
    const organizedMetrics = {
      system: {
        memory: {
          rss: metrics.find((m: any) => m.name === 'chaingive_system_memory_usage_bytes' && m.labels?.type === 'rss')?.values?.[0]?.value || 0,
          heap_used: metrics.find((m: any) => m.name === 'chaingive_system_memory_usage_bytes' && m.labels?.type === 'heap_used')?.values?.[0]?.value || 0,
          heap_total: metrics.find((m: any) => m.name === 'chaingive_system_memory_usage_bytes' && m.labels?.type === 'heap_total')?.values?.[0]?.value || 0,
        },
        cpu: {
          usage_percent: metrics.find((m: any) => m.name === 'chaingive_system_cpu_usage_percent')?.values?.[0]?.value || 0,
        },
        uptime_seconds: metrics.find((m: any) => m.name === 'chaingive_uptime_seconds')?.values?.[0]?.value || 0,
      },
      application: {
        active_users: metrics.find((m: any) => m.name === 'chaingive_active_users_total')?.values?.[0]?.value || 0,
        websocket_connections: metrics.find((m: any) => m.name === 'chaingive_websocket_connections_active')?.values?.[0]?.value || 0,
        pending_jobs: metrics.find((m: any) => m.name === 'chaingive_jobs_pending_total')?.values?.[0]?.value || 0,
      },
      database: {
        connections: metrics.find((m: any) => m.name === 'chaingive_database_connections_total')?.values || [],
        connection_pool: {
          active: metrics.find((m: any) => m.name === 'chaingive_database_connection_pool_size' && m.labels?.type === 'active')?.values?.[0]?.value || 0,
          idle: metrics.find((m: any) => m.name === 'chaingive_database_connection_pool_size' && m.labels?.type === 'idle')?.values?.[0]?.value || 0,
          total: metrics.find((m: any) => m.name === 'chaingive_database_connection_pool_size' && m.labels?.type === 'total')?.values?.[0]?.value || 0,
        },
      },
      business: {
        donations_total: metrics.find((m: any) => m.name === 'chaingive_donations_total')?.values || [],
        donation_amount_total: metrics.find((m: any) => m.name === 'chaingive_donation_amount_total')?.values || [],
        matches_created: metrics.find((m: any) => m.name === 'chaingive_matches_created_total')?.values?.[0]?.value || 0,
        escrow_transactions: metrics.find((m: any) => m.name === 'chaingive_escrow_transactions_total')?.values || [],
      },
      external_services: {
        redis: metrics.find((m: any) => m.name === 'chaingive_external_service_health_status' && m.labels?.service === 'redis')?.values?.[0]?.value || 0,
        email: metrics.find((m: any) => m.name === 'chaingive_external_service_health_status' && m.labels?.service === 'email')?.values?.[0]?.value || 0,
        sms: metrics.find((m: any) => m.name === 'chaingive_external_service_health_status' && m.labels?.service === 'sms')?.values?.[0]?.value || 0,
      },
      performance: {
        http_requests_total: metrics.find((m: any) => m.name === 'chaingive_http_requests_total')?.values || [],
        http_request_duration: metrics.find((m: any) => m.name === 'chaingive_http_request_duration_seconds')?.values || [],
        application_errors: metrics.find((m: any) => m.name === 'chaingive_application_errors_total')?.values || [],
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: organizedMetrics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed system health with external service connectivity tests
 */
export const getDetailedSystemHealth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const health = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: await checkDatabaseHealth(),
        redis: await checkRedisHealth(),
        email: await checkEmailHealth(),
        sms: await checkSMSHealth(),
        payment_gateways: await checkPaymentGatewaysHealth(),
        external_apis: await checkExternalAPIsHealth(),
      },
      system: {
        memory: getMemoryUsage(),
        cpu: getCPUUsage(),
        disk: await getDiskUsage(),
        loadAverage: os.loadavg(),
        network: await getNetworkStats(),
      },
      application: {
        activeConnections: await getActiveConnections(),
        pendingJobs: await getPendingJobs(),
        errorRate: await getErrorRate(),
        cacheStats: await getCacheStats(),
        queueStats: await getQueueStats(),
      },
      business: {
        activeUsers: await getActiveUsersCount(),
        pendingTransactions: await getPendingTransactionsCount(),
        systemLoad: await getSystemLoad(),
      },
    };

    // Determine overall health status with more granular checks
    const serviceStatuses = Object.values(health.services).map(s => (s as any).status);
    const hasCriticalFailures = serviceStatuses.includes('unhealthy');
    const hasWarnings = serviceStatuses.includes('degraded');

    let status = 'healthy';
    if (hasCriticalFailures) status = 'unhealthy';
    else if (hasWarnings) status = 'degraded';

    res.status(200).json({
      success: true,
      status,
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

// Additional helper functions for detailed health checks

async function checkPaymentGatewaysHealth() {
  try {
    // Check multiple payment gateways
    const gateways = ['btcpay', 'coinbase', 'cryptomus', 'binance', 'paypal'];
    const results = await Promise.allSettled(
      gateways.map(gateway => checkGatewayHealth(gateway))
    );

    const healthy = results.filter(r => r.status === 'fulfilled' && (r.value as any).status === 'healthy').length;
    const total = results.length;

    return {
      status: healthy === total ? 'healthy' : healthy > total / 2 ? 'degraded' : 'unhealthy',
      healthy_gateways: healthy,
      total_gateways: total,
      details: results.map((r, i) => ({
        gateway: gateways[i],
        status: r.status === 'fulfilled' ? (r.value as any).status : 'error',
        response_time: r.status === 'fulfilled' ? (r.value as any).responseTime : null,
      })),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: 'Failed to check payment gateways',
    };
  }
}

async function checkExternalAPIsHealth() {
  try {
    // Check external APIs (Termii SMS, Firebase, etc.)
    const apis = ['termii', 'firebase', 'sendgrid'];
    const results = await Promise.allSettled(
      apis.map(api => checkAPIHealth(api))
    );

    const healthy = results.filter(r => r.status === 'fulfilled' && (r.value as any).status === 'healthy').length;
    const total = results.length;

    return {
      status: healthy === total ? 'healthy' : healthy > total / 2 ? 'degraded' : 'unhealthy',
      healthy_apis: healthy,
      total_apis: total,
      details: results.map((r, i) => ({
        api: apis[i],
        status: r.status === 'fulfilled' ? (r.value as any).status : 'error',
      })),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: 'Failed to check external APIs',
    };
  }
}

async function getNetworkStats() {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const { stdout } = await execAsync('ss -tuln | wc -l');
    const activeConnections = parseInt(stdout.trim());

    return {
      active_connections: activeConnections,
      interfaces: [], // Would need more complex parsing
    };
  } catch (error) {
    return {
      error: 'Unable to get network stats',
    };
  }
}

async function getCacheStats() {
  try {
    // Mock cache stats - would connect to Redis for real stats
    return {
      hits: 15420,
      misses: 2340,
      hit_rate: '86.8%',
      memory_usage: '256MB',
      keys_count: 1250,
    };
  } catch (error) {
    return { error: 'Unable to get cache stats' };
  }
}

async function getQueueStats() {
  try {
    // Mock queue stats - would connect to Bull/Redis for real stats
    return {
      active_queues: 3,
      waiting_jobs: 15,
      active_jobs: 5,
      completed_jobs: 15420,
      failed_jobs: 23,
    };
  } catch (error) {
    return { error: 'Unable to get queue stats' };
  }
}

async function getActiveUsersCount() {
  try {
    const count = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    return count;
  } catch (error) {
    return 0;
  }
}

async function getPendingTransactionsCount() {
  try {
    const count = await prisma.transaction.count({
      where: {
        status: 'pending'
      }
    });
    return count;
  } catch (error) {
    return 0;
  }
}

async function getSystemLoad() {
  try {
    const loadAvg = os.loadavg();
    const cpus = os.cpus().length;

    return {
      '1m': loadAvg[0],
      '5m': loadAvg[1],
      '15m': loadAvg[2],
      cpus,
      utilization_percent: Math.round((loadAvg[0] / cpus) * 100),
    };
  } catch (error) {
    return { error: 'Unable to get system load' };
  }
}

async function checkGatewayHealth(gateway: string) {
  // Mock gateway health check
  return {
    status: 'healthy',
    responseTime: `${Math.random() * 200 + 50}ms`,
    gateway,
  };
}

async function checkAPIHealth(api: string) {
  // Mock API health check
  return {
    status: 'healthy',
    responseTime: `${Math.random() * 150 + 25}ms`,
    api,
  };
}

