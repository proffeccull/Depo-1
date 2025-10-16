/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import express from 'express';
import * as adminSystemController from '../src/controllers/adminSystem.controller';
import prisma from '../src/utils/prisma';
import { AuthRequest } from '../src/middleware/auth';

// Mock dependencies
jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    adminAction: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('os', () => ({
  loadavg: jest.fn().mockReturnValue([1.5, 1.2, 1.0]),
  cpus: jest.fn().mockReturnValue([
    {
      model: 'Intel Xeon',
      times: { user: 100, nice: 0, sys: 50, idle: 850, irq: 0 },
    },
  ]),
}));

jest.mock('child_process', () => ({
  exec: jest.fn(),
  promisify: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Admin System Controller', () => {
  let app: express.Application;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<any>;
  let mockNext: jest.MockedFunction<any>;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockRequest = {
      user: {
        id: 'admin-id',
        phoneNumber: '+1234567890',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'csc_council',
        tier: 3,
      },
      params: {},
      query: {},
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getSystemHealth', () => {
    it('should return comprehensive system health data', async () => {
      // Mock all the health check functions
      const mockHealthData = {
        timestamp: new Date().toISOString(),
        uptime: 3600,
        environment: 'test',
        version: '1.0.0',
        services: {
          database: { status: 'healthy', responseTime: '50ms' },
          redis: { status: 'healthy', memory: '256MB' },
          email: { status: 'healthy', provider: 'SendGrid' },
          sms: { status: 'healthy', provider: 'Termii' },
        },
        system: {
          memory: { rss: '100MB', heapUsed: '80MB' },
          cpu: { usage: '25%' },
          disk: { usePercent: '45%' },
          loadAverage: [1.5, 1.2, 1.0],
        },
        application: {
          activeConnections: 1250,
          pendingJobs: 15,
          errorRate: '0.05%',
        },
      };

      // Mock the helper functions
      jest.spyOn(adminSystemController as any, 'checkDatabaseHealth').mockResolvedValue(mockHealthData.services.database);
      jest.spyOn(adminSystemController as any, 'checkRedisHealth').mockResolvedValue(mockHealthData.services.redis);
      jest.spyOn(adminSystemController as any, 'checkEmailHealth').mockResolvedValue(mockHealthData.services.email);
      jest.spyOn(adminSystemController as any, 'checkSMSHealth').mockResolvedValue(mockHealthData.services.sms);
      jest.spyOn(adminSystemController as any, 'getMemoryUsage').mockReturnValue(mockHealthData.system.memory);
      jest.spyOn(adminSystemController as any, 'getCPUUsage').mockReturnValue(mockHealthData.system.cpu);
      jest.spyOn(adminSystemController as any, 'getDiskUsage').mockResolvedValue(mockHealthData.system.disk);
      jest.spyOn(adminSystemController as any, 'getActiveConnections').mockResolvedValue(mockHealthData.application.activeConnections);
      jest.spyOn(adminSystemController as any, 'getPendingJobs').mockResolvedValue(mockHealthData.application.pendingJobs);
      jest.spyOn(adminSystemController as any, 'getErrorRate').mockResolvedValue(mockHealthData.application.errorRate);

      await adminSystemController.getSystemHealth(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        status: 'healthy',
        data: expect.objectContaining({
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          services: expect.any(Object),
          system: expect.any(Object),
          application: expect.any(Object),
        }),
      });
    });

    it('should return degraded status when services are unhealthy', async () => {
      jest.spyOn(adminSystemController as any, 'checkDatabaseHealth').mockResolvedValue({ status: 'unhealthy' });
      jest.spyOn(adminSystemController as any, 'checkRedisHealth').mockResolvedValue({ status: 'healthy' });
      jest.spyOn(adminSystemController as any, 'checkEmailHealth').mockResolvedValue({ status: 'healthy' });
      jest.spyOn(adminSystemController as any, 'checkSMSHealth').mockResolvedValue({ status: 'healthy' });
      jest.spyOn(adminSystemController as any, 'getMemoryUsage').mockReturnValue({});
      jest.spyOn(adminSystemController as any, 'getCPUUsage').mockReturnValue({});
      jest.spyOn(adminSystemController as any, 'getDiskUsage').mockResolvedValue({});
      jest.spyOn(adminSystemController as any, 'getActiveConnections').mockResolvedValue(0);
      jest.spyOn(adminSystemController as any, 'getPendingJobs').mockResolvedValue(0);
      jest.spyOn(adminSystemController as any, 'getErrorRate').mockResolvedValue('0%');

      await adminSystemController.getSystemHealth(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        status: 'degraded',
        data: expect.any(Object),
      });
    });
  });

  describe('getDatabaseHealth', () => {
    it('should return database health metrics', async () => {
      const mockDbHealth = { status: 'healthy', responseTime: '45ms' };
      const mockMetrics = {
        connections: [{ active: 5 }],
        activeQueries: [{ active: 2 }],
        topTables: [],
      };

      jest.spyOn(adminSystemController as any, 'checkDatabaseHealth').mockResolvedValue(mockDbHealth);
      jest.spyOn(adminSystemController as any, 'getDatabaseMetrics').mockResolvedValue(mockMetrics);

      await adminSystemController.getDatabaseHealth(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockDbHealth,
          metrics: mockMetrics,
        },
      });
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics for specified period', async () => {
      const mockMetrics = {
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

      jest.spyOn(adminSystemController as any, 'getPerformanceData').mockResolvedValue(mockMetrics);

      mockRequest.query = { period: '24h' };

      await adminSystemController.getPerformanceMetrics(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          period: '24h',
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          metrics: mockMetrics,
        },
      });
    });

    it('should default to 1h period', async () => {
      jest.spyOn(adminSystemController as any, 'getPerformanceData').mockResolvedValue({});

      await adminSystemController.getPerformanceMetrics(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          period: '1h',
        }),
      });
    });
  });

  describe('getSystemLogs', () => {
    it('should return filtered system logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          action: 'system_error',
          details: JSON.stringify({ error: 'Database connection failed' }),
          createdAt: new Date(),
        },
      ];

      (prisma.adminAction.findMany as jest.Mock).mockResolvedValue(mockLogs);

      mockRequest.query = { level: 'error', limit: '50' };

      await adminSystemController.getSystemLogs(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.adminAction.findMany).toHaveBeenCalledWith({
        where: {
          action: { in: ['system_error', 'system_warning'] },
          createdAt: undefined,
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          logs: mockLogs,
          total: 1,
          filters: { level: 'error', limit: 50, startDate: undefined, endDate: undefined },
        },
      });
    });

    it('should filter by date range', async () => {
      (prisma.adminAction.findMany as jest.Mock).mockResolvedValue([]);

      mockRequest.query = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z'
      };

      await adminSystemController.getSystemLogs(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.adminAction.findMany).toHaveBeenCalledWith({
        where: {
          action: { in: ['system_error', 'system_warning'] },
          createdAt: {
            gte: new Date('2024-01-01T00:00:00Z'),
            lte: new Date('2024-01-31T23:59:59Z'),
          },
        },
        take: 100,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('triggerMaintenance', () => {
    it('should trigger cleanup maintenance successfully', async () => {
      const mockResult = {
        tempFilesRemoved: 15,
        oldLogsCleaned: '2.3GB',
        cacheCleared: true,
        duration: '2.5s',
      };

      jest.spyOn(adminSystemController as any, 'performCleanup').mockResolvedValue(mockResult);

      mockRequest.body = { action: 'cleanup', reason: 'Regular maintenance' };

      await adminSystemController.triggerMaintenance(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.adminAction.create).toHaveBeenCalledWith({
        data: {
          adminId: 'admin-id',
          action: 'system_maintenance_cleanup',
          details: JSON.stringify({ reason: 'Regular maintenance', automated: false }),
        }
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'System maintenance \'cleanup\' completed',
        data: {
          action: 'cleanup',
          result: mockResult,
          timestamp: expect.any(String),
        },
      });
    });

    it('should reject invalid maintenance action', async () => {
      mockRequest.body = { action: 'invalid_action' };

      await adminSystemController.triggerMaintenance(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid maintenance action',
          statusCode: 400,
        })
      );
    });
  });

  describe('getBackupStatus', () => {
    it('should return backup status and history', async () => {
      await adminSystemController.getBackupStatus(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          backups: expect.arrayContaining([
            expect.objectContaining({
              id: expect.stringContaining('backup-'),
              type: expect.any(String),
              status: 'completed',
              size: expect.any(String),
              createdAt: expect.any(Date),
              location: expect.any(String),
            }),
          ]),
          lastBackup: expect.any(Object),
          nextScheduledBackup: expect.any(Date),
        }),
      });
    });
  });

  // Helper function tests
  describe('checkDatabaseHealth', () => {
    it('should return healthy status when database responds', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '1': 1 }]);

      const result = await (adminSystemController as any).checkDatabaseHealth();

      expect(result).toEqual({
        status: 'healthy',
        responseTime: expect.stringMatching(/\d+ms/),
        connectionPool: {
          active: 1,
          idle: 5,
          total: 10,
        },
      });
    });

    it('should return unhealthy status when database fails', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const result = await (adminSystemController as any).checkDatabaseHealth();

      expect(result).toEqual({
        status: 'unhealthy',
        error: 'Connection failed',
      });
    });
  });

  describe('getMemoryUsage', () => {
    it('should return formatted memory usage', () => {
      const mockMemoryUsage = {
        rss: 104857600, // 100MB
        heapTotal: 83886080, // 80MB
        heapUsed: 67108864, // 64MB
        external: 2097152, // 2MB
      };

      jest.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage as any);

      const result = (adminSystemController as any).getMemoryUsage();

      expect(result).toEqual({
        rss: '100MB',
        heapTotal: '80MB',
        heapUsed: '64MB',
        external: '2MB',
        usagePercent: expect.any(Number),
      });
    });
  });

  describe('getCPUUsage', () => {
    it('should calculate CPU usage correctly', () => {
      const result = (adminSystemController as any).getCPUUsage();

      expect(result).toEqual({
        cores: 1,
        usage: expect.stringMatching(/\d+%/),
        model: 'Intel Xeon',
      });
    });
  });

  describe('getDatabaseMetrics', () => {
    it('should return database metrics', async () => {
      const mockConnectionCount = [{ connections: 15 }];
      const mockActiveQueries = [{ active: 3 }];
      const mockTableStats = [
        { schemaname: 'public', tablename: 'users', n_tup_ins: 1000, n_tup_upd: 500, n_tup_del: 50 },
      ];

      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce(mockConnectionCount)
        .mockResolvedValueOnce(mockActiveQueries)
        .mockResolvedValueOnce(mockTableStats);

      const result = await (adminSystemController as any).getDatabaseMetrics();

      expect(result).toEqual({
        connections: mockConnectionCount,
        activeQueries: mockActiveQueries,
        topTables: mockTableStats,
      });
    });

    it('should handle database errors gracefully', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Query failed'));

      const result = await (adminSystemController as any).getDatabaseMetrics();

      expect(result).toEqual({ error: 'Unable to fetch database metrics' });
    });
  });

  describe('performCleanup', () => {
    it('should return cleanup results', async () => {
      const result = await (adminSystemController as any).performCleanup();

      expect(result).toEqual({
        tempFilesRemoved: 15,
        oldLogsCleaned: '2.3GB',
        cacheCleared: true,
        duration: '2.5s',
      });
    });
  });

  describe('performOptimization', () => {
    it('should return optimization results', async () => {
      const result = await (adminSystemController as any).performOptimization();

      expect(result).toEqual({
        tablesOptimized: 25,
        indexesRebuilt: 8,
        queriesOptimized: 12,
        duration: '45s',
      });
    });
  });

  describe('triggerBackup', () => {
    it('should return backup scheduling results', async () => {
      const result = await (adminSystemController as any).triggerBackup();

      expect(result).toEqual({
        backupId: expect.stringMatching(/^backup-\d+$/),
        type: 'full',
        status: 'scheduled',
        estimatedSize: '2.8GB',
        scheduledFor: expect.any(Date),
      });
    });
  });
});