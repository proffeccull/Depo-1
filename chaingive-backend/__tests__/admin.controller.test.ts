/* eslint-disable @typescript-eslint/no-explicit-any */
const mockJest = {
  fn: () => jest.fn(),
  mockResolvedValue: (val: any) => val,
  mockReturnThis: () => mockJest,
  mockReturnValue: (val: any) => val,
  clearAllMocks: () => {},
  resetAllMocks: () => {},
};

const describe = (name: string, fn: Function) => global.describe(name, fn);
const it = (name: string, fn: Function) => global.it(name, fn);
const expect = (val: any) => global.expect(val);
const beforeEach = (fn: Function) => global.beforeEach(fn);
const afterEach = (fn: Function) => global.afterEach(fn);
const jest = mockJest;
import { Request, Response } from 'express';
import * as adminController from '../src/controllers/admin.controller';
import prisma from '../src/utils/prisma';
import { AuthRequest } from '../src/middleware/auth';

// Mock dependencies
jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    escrow: {
      aggregate: jest.fn(),
    },
    cycle: {
      count: jest.fn(),
    },
    kycRecord: {
      count: jest.fn(),
    },
    agent: {
      count: jest.fn(),
    },
    adminAction: {
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('Admin Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<any>;

  beforeEach(() => {
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

  describe('getAllUsers', () => {
    it('should return paginated users list', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          phoneNumber: '+1234567890',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'beginner',
          tier: 1,
          trustScore: 5.0,
          totalCyclesCompleted: 5,
          totalDonated: 25000,
          totalReceived: 20000,
          charityCoinsBalance: 100,
          kycStatus: 'approved',
          isActive: true,
          isBanned: false,
          locationCity: 'Lagos',
          locationState: 'Lagos',
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      mockRequest.query = { page: '1', limit: '20' };

      await adminController.getAllUsers(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          users: mockUsers,
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
        },
      });
    });

    it('should filter users by role', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      mockRequest.query = { role: 'agent' };

      await adminController.getAllUsers(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'agent' },
        skip: 0,
        take: 20,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getUserDetails', () => {
    it('should return user details with full activity history', async () => {
      const mockUser = {
        id: 'user-1',
        phoneNumber: '+1234567890',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'beginner',
        tier: 1,
        wallet: { fiatBalance: 50000 },
        cycles: [],
        sentTransactions: [],
        receivedTransactions: [],
        kycRecords: [],
        agent: null,
        leaderboard: null,
        referralsGiven: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };

      await adminController.getUserDetails(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { userId: 'non-existent' };

      await adminController.getUserDetails(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
          statusCode: 404,
        })
      );
    });
  });

  describe('banUser', () => {
    it('should ban a user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        isBanned: true,
        isActive: false,
        banReason: 'Violation of terms',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = { reason: 'Violation of terms' };

      await adminController.banUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isBanned: true,
          isActive: false,
          banReason: 'Violation of terms',
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User banned successfully',
        data: {
          userId: 'user-1',
          isBanned: true,
          banReason: 'Violation of terms',
        },
      });
    });

    it('should ban user without reason', async () => {
      const mockUser = {
        id: 'user-1',
        isBanned: true,
        isActive: false,
        banReason: null,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {};

      await adminController.banUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isBanned: true,
          isActive: false,
          banReason: undefined,
        },
      });
    });
  });

  describe('unbanUser', () => {
    it('should unban a user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        isBanned: false,
        isActive: true,
        banReason: null,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };

      await adminController.unbanUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isBanned: false,
          isActive: true,
          banReason: null,
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User unbanned successfully',
        data: {
          userId: 'user-1',
          isBanned: false,
        },
      });
    });
  });

  describe('updateUser', () => {
    it('should update user details successfully', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
        locationCity: 'New City',
        locationState: 'New State',
        isActive: false,
        trustScore: 4.5,
        tier: 2,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        firstName: 'Old',
        lastName: 'Name',
        email: 'old@example.com',
        locationCity: 'Old City',
        locationState: 'Old State',
        isActive: true,
        trustScore: 3.0,
        tier: 1,
      });

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
        locationCity: 'New City',
        locationState: 'New State',
        isActive: false,
        trustScore: 4.5,
        tier: 2,
      };

      await adminController.updateUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          firstName: 'Updated',
          lastName: 'Name',
          email: 'updated@example.com',
          locationCity: 'New City',
          locationState: 'New State',
          isActive: false,
          trustScore: 4.5,
          tier: 2,
        },
        select: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User updated successfully',
        data: mockUser,
      });
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { userId: 'non-existent' };
      mockRequest.body = { firstName: 'Test' };

      await adminController.updateUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
          statusCode: 404,
        })
      );
    });

    it('should handle partial updates', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'Updated',
        lastName: 'Name',
        email: 'old@example.com',
        locationCity: 'Old City',
        locationState: 'Old State',
        isActive: true,
        trustScore: 3.0,
        tier: 1,
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        firstName: 'Old',
        lastName: 'Name',
        email: 'old@example.com',
        locationCity: 'Old City',
        locationState: 'Old State',
        isActive: true,
        trustScore: 3.0,
        tier: 1,
      });

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      await adminController.updateUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          firstName: 'Updated',
          lastName: 'Name',
        },
        select: expect.any(Object),
      });
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = { reason: 'Account closure request' };

      await adminController.deleteUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isActive: false,
          isBanned: true,
          banReason: 'Account closure request',
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deactivated successfully',
        data: {
          userId: 'user-1',
          action: 'deactivated',
        },
      });
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { userId: 'non-existent' };
      mockRequest.body = { reason: 'Test' };

      await adminController.deleteUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
          statusCode: 404,
        })
      );
    });

    it('should reject deletion of already deactivated user', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        isActive: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = { reason: 'Test' };

      await adminController.deleteUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User is already deactivated',
          statusCode: 400,
        })
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const mockNewUser = {
        id: 'new-user-id',
        phoneNumber: '+1234567890',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'beginner',
        tier: 1,
        isActive: true,
        createdAt: new Date(),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockNewUser);

      mockRequest.body = {
        phoneNumber: '+1234567890',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'beginner',
        tier: 1,
        isActive: true,
      };

      await adminController.createUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phoneNumber: '+1234567890',
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'beginner',
          tier: 1,
          isActive: true,
          passwordHash: 'hashed_password',
          kycStatus: 'not_required',
        }),
        select: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User created successfully',
        data: expect.objectContaining({
          ...mockNewUser,
          tempPassword: expect.any(String),
        }),
      });
    });

    it('should reject duplicate phone number', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        phoneNumber: '+1234567890',
      });

      mockRequest.body = {
        phoneNumber: '+1234567890',
        firstName: 'New',
        lastName: 'User',
      };

      await adminController.createUser(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User with this phone number or email already exists',
          statusCode: 409,
        })
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return comprehensive dashboard statistics', async () => {
      const mockStats = {
        totalUsers: 1000,
        activeUsers: 800,
        totalTransactions: 5000,
        totalVolume: { _sum: { amount: 2500000 } },
        pendingEscrows: { _sum: { amount: 500000 } },
        completedCycles: 3000,
        pendingKYC: 50,
        totalAgents: 100,
        totalCoinsInCirculation: { _sum: { charityCoinsBalance: 50000 } },
      };

      // Mock all the aggregate calls
      (prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(mockStats.totalUsers)
        .mockResolvedValueOnce(mockStats.activeUsers);

      (prisma.transaction.count as jest.Mock).mockResolvedValue(mockStats.totalTransactions);
      (prisma.transaction.aggregate as jest.Mock)
        .mockResolvedValueOnce(mockStats.totalVolume)
        .mockResolvedValueOnce({ _sum: { amount: 500000 } }); // today's volume

      (prisma.escrow.aggregate as jest.Mock).mockResolvedValue(mockStats.pendingEscrows);
      (prisma.cycle.count as jest.Mock).mockResolvedValue(mockStats.completedCycles);
      (prisma.kycRecord.count as jest.Mock).mockResolvedValue(mockStats.pendingKYC);
      (prisma.agent.count as jest.Mock).mockResolvedValue(mockStats.totalAgents);
      (prisma.user.aggregate as jest.Mock).mockResolvedValue(mockStats.totalCoinsInCirculation);

      await adminController.getDashboardStats(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          overview: expect.objectContaining({
            totalUsers: 1000,
            activeUsers: 800,
            totalTransactions: 5000,
            totalVolume: 2500000,
            pendingEscrows: 500000,
            completedCycles: 3000,
            totalAgents: 100,
            totalCoinsInCirculation: 50000,
          }),
          today: expect.any(Object),
          pending: expect.any(Object),
        }),
      });
    });

    it('should handle database errors gracefully', async () => {
      (prisma.user.count as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      await adminController.getDashboardStats(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getSuspiciousTransactions', () => {
    it('should return suspicious transactions with default limit', async () => {
      const mockTransactions = [
        {
          id: 'transaction-1',
          amount: 60000,
          status: 'completed',
          fromUser: { id: 'user-1', firstName: 'John', lastName: 'Doe', trustScore: 2.5 },
          toUser: { id: 'user-2', firstName: 'Jane', lastName: 'Smith', trustScore: 4.0 },
        },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      await adminController.getSuspiciousTransactions(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { amount: { gte: 50000 } },
            { status: 'failed' },
            {
              fromUser: {
                trustScore: { lt: 3.0 },
              },
            },
          ],
        },
        take: 50,
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          transactions: mockTransactions,
          total: 1,
        },
      });
    });

    it('should respect custom limit', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      mockRequest.query = { limit: '100' };

      await adminController.getSuspiciousTransactions(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        take: 100,
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getPendingKYC', () => {
    it('should return pending KYC records with default limit', async () => {
      const mockKycRecords = [
        {
          id: 'kyc-1',
          status: 'pending',
          user: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1234567890',
            email: 'john@example.com',
            tier: 1,
            createdAt: new Date(),
          },
        },
      ];

      (prisma.kycRecord.findMany as jest.Mock).mockResolvedValue(mockKycRecords);

      await adminController.getPendingKYC(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.kycRecord.findMany).toHaveBeenCalledWith({
        where: { status: 'pending' },
        take: 50,
        include: expect.any(Object),
        orderBy: { createdAt: 'asc' },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          kycRecords: mockKycRecords,
          total: 1,
        },
      });
    });

    it('should respect custom limit', async () => {
      (prisma.kycRecord.findMany as jest.Mock).mockResolvedValue([]);

      mockRequest.query = { limit: '25' };

      await adminController.getPendingKYC(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.kycRecord.findMany).toHaveBeenCalledWith({
        where: { status: 'pending' },
        take: 25,
        include: expect.any(Object),
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('approveKYC', () => {
    it('should approve KYC and upgrade tier for BVN/NIN verification', async () => {
      const mockKycRecord = {
        id: 'kyc-1',
        verificationType: 'bvn',
        userId: 'user-1',
        user: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
        },
      };

      (prisma.kycRecord.update as jest.Mock).mockResolvedValue(mockKycRecord);

      mockRequest.params = { kycId: 'kyc-1' };

      await adminController.approveKYC(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          tier: 2,
          kycStatus: 'approved',
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'KYC approved successfully',
        data: mockKycRecord,
      });
    });

    it('should not upgrade tier for non-BVN/NIN verification', async () => {
      const mockKycRecord = {
        id: 'kyc-1',
        verificationType: 'address',
        userId: 'user-1',
        user: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '+1234567890',
        },
      };

      (prisma.kycRecord.update as jest.Mock).mockResolvedValue(mockKycRecord);

      mockRequest.params = { kycId: 'kyc-1' };

      await adminController.approveKYC(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('rejectKYC', () => {
    it('should reject KYC with reason', async () => {
      const mockKycRecord = {
        id: 'kyc-1',
        status: 'rejected',
        rejectionReason: 'Invalid document',
        userId: 'user-1',
        user: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      (prisma.kycRecord.update as jest.Mock).mockResolvedValue(mockKycRecord);

      mockRequest.params = { kycId: 'kyc-1' };
      mockRequest.body = { reason: 'Invalid document' };

      await adminController.rejectKYC(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.kycRecord.update).toHaveBeenCalledWith({
        where: { id: 'kyc-1' },
        data: {
          status: 'rejected',
          rejectionReason: 'Invalid document',
          verifiedByUserId: 'admin-id',
          verifiedAt: expect.any(Date),
        },
        include: { user: true },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'KYC rejected',
        data: mockKycRecord,
      });
    });
  });

  describe('getRevenueReport', () => {
    it('should return revenue report for default period', async () => {
      const mockCoinSales = { _sum: { totalPrice: 100000 }, _count: 50 };
      const mockRedemptions = { _sum: { coinsSpent: 25000 }, _count: 25 };
      const mockTransactionFees = { _sum: { amount: 5000000 }, _count: 1000 };

      (prisma.coinSaleToUser.aggregate as jest.Mock).mockResolvedValue(mockCoinSales);
      (prisma.redemption.aggregate as jest.Mock).mockResolvedValue(mockRedemptions);
      (prisma.transaction.aggregate as jest.Mock).mockResolvedValue(mockTransactionFees);

      await adminController.getRevenueReport(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          period: expect.any(Object),
          revenue: expect.objectContaining({
            coinSales: 100000,
            transactionFees: 75000, // 5000000 * 0.015 (1.5% fee)
            total: 175000,
          }),
          metrics: expect.objectContaining({
            coinsSold: 50,
            itemsRedeemed: 25,
            transactionsProcessed: 1000,
            totalVolume: 5000000,
          }),
        }),
      });
    });

    it('should handle custom date range', async () => {
      (prisma.coinSaleToUser.aggregate as jest.Mock).mockResolvedValue({ _sum: { totalPrice: null }, _count: 0 });
      (prisma.redemption.aggregate as jest.Mock).mockResolvedValue({ _sum: { coinsSpent: null }, _count: 0 });
      (prisma.transaction.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: null }, _count: 0 });

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await adminController.getRevenueReport(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.coinSaleToUser.aggregate).toHaveBeenCalledWith({
        _sum: { totalPrice: true },
        _count: true,
        where: {
          createdAt: { gte: new Date('2024-01-01'), lte: new Date('2024-01-31') },
        },
      });
    });
  });

  describe('getUserGrowthReport', () => {
    it('should return user growth metrics for default period', async () => {
      const mockNewUsers = 150;
      const mockActiveUsers = 120;
      const mockRetentionData = [
        { createdAt: new Date(), lastLoginAt: new Date() },
        { createdAt: new Date(), lastLoginAt: null },
      ];

      (prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(mockNewUsers)
        .mockResolvedValueOnce(mockActiveUsers);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockRetentionData);

      await adminController.getUserGrowthReport(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          period: '30 days',
          newUsers: 150,
          activeUsers: 120,
          retentionRate: '50.00',
          dailyAverage: '5.0',
        }),
      });
    });

    it('should handle different periods', async () => {
      (prisma.user.count as jest.Mock).mockResolvedValue(0);
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      mockRequest.query = { period: '7d' };

      await adminController.getUserGrowthReport(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          period: '7 days',
        }),
      });
    });
  });

  describe('overrideDonation', () => {
    it('should override donation transaction successfully', async () => {
      const mockTransaction = {
        id: 'transaction-1',
        amount: 50000,
        status: 'pending',
        fromUser: { firstName: 'John', lastName: 'Doe' },
        toUser: { firstName: 'Jane', lastName: 'Smith' },
      };

      const mockUpdatedTransaction = {
        ...mockTransaction,
        amount: 75000,
        status: 'completed',
      };

      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(mockTransaction);
      (prisma.transaction.update as jest.Mock).mockResolvedValue(mockUpdatedTransaction);

      mockRequest.params = { transactionId: 'transaction-1' };
      mockRequest.body = {
        amount: 75000,
        status: 'completed',
        reason: 'Amount correction',
      };

      await adminController.overrideDonation(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'transaction-1' },
        data: {
          amount: 75000,
          status: 'completed',
          notes: 'Amount correction',
        },
        include: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Donation overridden successfully',
        data: expect.objectContaining({
          transactionId: 'transaction-1',
          oldAmount: 50000,
          newAmount: 75000,
          oldStatus: 'pending',
          newStatus: 'completed',
          reason: 'Amount correction',
        }),
      });
    });

    it('should validate status parameter', async () => {
      mockRequest.params = { transactionId: 'transaction-1' };
      mockRequest.body = {
        status: 'invalid_status',
        reason: 'Test',
      };

      await adminController.overrideDonation(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid status'),
          statusCode: 400,
        })
      );
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions and roles', async () => {
      const mockUser = {
        id: 'user-1',
        role: 'agent',
        tier: 2,
        kycStatus: 'approved',
        trustScore: 4.5,
        isActive: true,
        isBanned: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };

      await adminController.getUserPermissions(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          role: 'agent',
          tier: 2,
          kycStatus: 'approved',
          trustScore: 4.5,
          isActive: true,
          isBanned: false,
          rolePermissions: expect.arrayContaining([
            'donate',
            'receive',
            'view_profile',
            'sell_coins',
            'manage_inventory',
          ]),
          tierPermissions: expect.arrayContaining([
            'basic_donations',
            'verified_beneficiary',
          ]),
          customPermissions: [],
        }),
      });
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { userId: 'non-existent' };

      await adminController.getUserPermissions(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
          statusCode: 404,
        })
      );
    });
  });

  describe('overrideDonation', () => {
    it('should override donation transaction successfully', async () => {
      const mockTransaction = {
        id: 'transaction-1',
        amount: 50000,
        status: 'pending',
        fromUser: { firstName: 'John', lastName: 'Doe' },
        toUser: { firstName: 'Jane', lastName: 'Smith' },
      };

      const mockUpdatedTransaction = {
        ...mockTransaction,
        amount: 75000,
        status: 'completed',
      };

      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(mockTransaction);
      (prisma.transaction.update as jest.Mock).mockResolvedValue(mockUpdatedTransaction);

      mockRequest.params = { transactionId: 'transaction-1' };
      mockRequest.body = {
        amount: 75000,
        status: 'completed',
        reason: 'Amount correction',
      };

      await adminController.overrideDonation(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'transaction-1' },
        data: {
          amount: 75000,
          status: 'completed',
          notes: 'Amount correction',
        },
        include: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Donation overridden successfully',
        data: expect.objectContaining({
          transactionId: 'transaction-1',
          oldAmount: 50000,
          newAmount: 75000,
          oldStatus: 'pending',
          newStatus: 'completed',
          reason: 'Amount correction',
        }),
      });
    });

    it('should validate status parameter', async () => {
      mockRequest.params = { transactionId: 'transaction-1' };
      mockRequest.body = {
        status: 'invalid_status',
        reason: 'Test',
      };

      await adminController.overrideDonation(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid status'),
          statusCode: 400,
        })
      );
    });

    it('should return 404 for non-existent transaction', async () => {
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { transactionId: 'non-existent' };
      mockRequest.body = {
        amount: 10000,
        reason: 'Test',
      };

      await adminController.overrideDonation(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Transaction not found',
          statusCode: 404,
        })
      );
    });

    it('should handle amount-only updates', async () => {
      const mockTransaction = {
        id: 'transaction-1',
        amount: 50000,
        status: 'pending',
        fromUser: { firstName: 'John', lastName: 'Doe' },
        toUser: { firstName: 'Jane', lastName: 'Smith' },
      };

      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(mockTransaction);

      mockRequest.params = { transactionId: 'transaction-1' };
      mockRequest.body = {
        amount: 60000,
        reason: 'Amount adjustment',
      };

      await adminController.overrideDonation(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'transaction-1' },
        data: {
          amount: 60000,
          notes: 'Amount adjustment',
        },
        include: expect.any(Object),
      });
    });
  });
});