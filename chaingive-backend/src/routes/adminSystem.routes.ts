import { Router } from 'express';
import * as adminSystemController from '../controllers/adminSystem.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';

const router = Router();

// All routes require authentication and admin/csc_council role
router.use(authenticate);
router.use(requireRole('csc_council', 'agent')); // Admin roles

/**
 * @swagger
 * /admin/system/health:
 *   get:
 *     summary: Get comprehensive system health overview
 *     description: Returns detailed system health metrics including database, Redis, email, SMS services, memory, CPU, and disk usage
 *     tags: [System Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                   example: healthy
 *                 data:
 *                   $ref: '#/components/schemas/SystemHealth'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/health', adminSystemController.getSystemHealth);

/**
 * @swagger
 * /admin/system/health/database:
 *   get:
 *     summary: Get detailed database health metrics
 *     description: Returns comprehensive database health information including connection pools, active queries, and performance metrics
 *     tags: [System Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database health metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     responseTime:
 *                       type: string
 *                       example: "45ms"
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         connections:
 *                           type: array
 *                           description: Active database connections
 *                         activeQueries:
 *                           type: array
 *                           description: Currently running queries
 *                         topTables:
 *                           type: array
 *                           description: Most active database tables
 */
router.get('/health/database', adminSystemController.getDatabaseHealth);

/**
 * @swagger
 * /admin/system/metrics:
 *   get:
 *     summary: Get application performance metrics
 *     description: Returns performance metrics for the specified time period including request counts, response times, and error rates
 *     tags: [System Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1h, 24h, 7d]
 *           default: 1h
 *         description: Time period for metrics aggregation
 *     responses:
 *       200:
 *         description: Performance metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                       example: "1h"
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         requests:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: number
 *                               example: 15420
 *                             averageResponseTime:
 *                               type: string
 *                               example: "245ms"
 *                             p95ResponseTime:
 *                               type: string
 *                               example: "890ms"
 *                             errorRate:
 *                               type: string
 *                               example: "0.02%"
 *                         database:
 *                           type: object
 *                           properties:
 *                             queryCount:
 *                               type: number
 *                               example: 45230
 *                             averageQueryTime:
 *                               type: string
 *                               example: "12ms"
 *                             slowQueries:
 *                               type: number
 *                               example: 23
 *                         memory:
 *                           type: object
 *                           properties:
 *                             peakUsage:
 *                               type: string
 *                               example: "512MB"
 *                             averageUsage:
 *                               type: string
 *                               example: "387MB"
 *                             gcCollections:
 *                               type: number
 *                               example: 145
 */
router.get('/metrics', adminSystemController.getPerformanceMetrics);

/**
 * @swagger
 * /admin/system/logs:
 *   get:
 *     summary: Get system logs with filtering
 *     description: Returns system logs filtered by level, date range, and pagination. Logs are retrieved from admin actions table.
 *     tags: [System Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, all]
 *           default: error
 *         description: Log level to filter by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Maximum number of logs to return
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for log filtering (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for log filtering (ISO format)
 *     responses:
 *       200:
 *         description: System logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminAction'
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     filters:
 *                       type: object
 *                       properties:
 *                         level:
 *                           type: string
 *                           example: "error"
 *                         limit:
 *                           type: integer
 *                           example: 100
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 */
router.get('/logs', adminSystemController.getSystemLogs);

/**
 * @swagger
 * /admin/system/maintenance:
 *   post:
 *     summary: Trigger system maintenance operations
 *     description: Executes various system maintenance operations like cleanup, optimization, or backup. All actions are logged in the admin actions table.
 *     tags: [System Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - reason
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [cleanup, optimize, backup]
 *                 example: cleanup
 *                 description: Type of maintenance action to perform
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: "Regular system maintenance to improve performance"
 *                 description: Reason for performing the maintenance action
 *     responses:
 *       200:
 *         description: Maintenance operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "System maintenance 'cleanup' completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     action:
 *                       type: string
 *                       example: "cleanup"
 *                     result:
 *                       type: object
 *                       description: Result details specific to the maintenance action
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid maintenance action or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  '/maintenance',
  validate(
    Joi.object({
      action: Joi.string().valid('cleanup', 'optimize', 'backup').required(),
      reason: Joi.string().min(10).max(500).required(),
    })
  ),
  adminSystemController.triggerMaintenance
);

/**
 * @swagger
 * /admin/system/backup:
 *   get:
 *     summary: Get backup status and history
 *     description: Returns information about recent backups including status, size, and scheduling information
 *     tags: [System Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     backups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "backup-001"
 *                           type:
 *                             type: string
 *                             enum: [full, incremental]
 *                             example: "full"
 *                           status:
 *                             type: string
 *                             enum: [completed, failed, in_progress]
 *                             example: "completed"
 *                           size:
 *                             type: string
 *                             example: "2.5GB"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           location:
 *                             type: string
 *                             example: "s3://chaingive-backups/"
 *                     lastBackup:
 *                       type: object
 *                       description: Most recent backup information
 *                     nextScheduledBackup:
 *                       type: string
 *                       format: date-time
 *                       description: When the next backup is scheduled
 */
router.get('/backup', adminSystemController.getBackupStatus);

/**
 * @swagger
 * /admin/system/metrics/prometheus:
 *   get:
 *     summary: Get Prometheus metrics in human-readable format
 *     description: Returns Prometheus metrics in a formatted, human-readable JSON format instead of the raw Prometheus text format
 *     tags: [System Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prometheus metrics retrieved successfully in JSON format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     system:
 *                       type: object
 *                       description: System-level metrics
 *                     application:
 *                       type: object
 *                       description: Application-specific metrics
 *                     database:
 *                       type: object
 *                       description: Database metrics
 *                     external_services:
 *                       type: object
 *                       description: External service health metrics
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.get('/metrics/prometheus', adminSystemController.getPrometheusMetrics);

/**
 * @swagger
 * /admin/system/health/detailed:
 *   get:
 *     summary: Get detailed system health with external service checks
 *     description: Returns comprehensive system health including external service connectivity tests (Redis, email, SMS, payment gateways)
 *     tags: [System Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed system health retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                   example: healthy
 *                 data:
 *                   $ref: '#/components/schemas/DetailedSystemHealth'
 */
router.get('/health/detailed', adminSystemController.getDetailedSystemHealth);

export default router;