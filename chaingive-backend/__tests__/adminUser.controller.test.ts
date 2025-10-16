/* eslint-disable @typescript-eslint/no-explicit-any */
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

jest.mock('../src/services/email.service', () => ({
  sendKYCApprovalEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/sms.service', () => ({
  sendKYCApprovalSMS: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Admin User Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<any>;
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
    it('should return paginated users list with default parameters', async () => {
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
        mockResponse as any,
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

    it('should filter users by multiple criteria', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      mockRequest.query = {
        role: 'agent',
        tier: '2',
        kycStatus: 'approved',
        isActive: 'true',
        city: 'Lagos',
        search: 'john'
      };

      await adminController.getAllUsers(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          role: 'agent',
          tier: 2,
          kycStatus: 'approved',
          isActive: true,
          locationCity: 'Lagos',
          OR: [
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
            { phoneNumber: { contains: 'john' } },
            { email: { contains: 'john', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 20,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle pagination correctly', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(150);

      mockRequest.query = { page: '3', limit: '25' };

      await adminController.getAllUsers(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 50, // (3-1) * 25
        take: 25,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          users: [],
          pagination: {
            page: 3,
            limit: 25,
            total: 150,
            totalPages: 6, // Math.ceil(150/25)
          },
        },
      });
    });
  });

  describe('getUserDetails', () => {
    it('should return comprehensive user details with all relations', async () => {
      const mockUser = {
        id: 'user-1',
        phoneNumber: '+1234567890',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'agent',
        tier: 2,
        wallet: { fiatBalance: 50000 },
        cycles: [
          { id: 'cycle-1', status: 'completed', amount: 10000, createdAt: new Date() },
          { id: 'cycle-2', status: 'pending', amount: 15000, createdAt: new Date() },
        ],
        sentTransactions: [
          { id: 'tx-1', amount: 10000, status: 'completed', createdAt: new Date() },
        ],
        receivedTransactions: [
          { id: 'tx-2', amount: 8000, status: 'completed', createdAt: new Date() },
        ],
        kycRecords: [
          { id: 'kyc-1', status: 'approved', verificationType: 'bvn', createdAt: new Date() },
        ],
        agent: {
          id: 'agent-1',
          agentCode: 'AG123456',
          coinBalance: 500,
        },
        leaderboard: {
          totalScore: 150,
          rank: 5,
        },
        referralsGiven: [
          {
            referredUser: {
              firstName: 'Jane',
              lastName: 'Smith',
              totalCyclesCompleted: 3,
            },
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };

      await adminController.getUserDetails(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          wallet: true,
          cycles: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          sentTransactions: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          receivedTransactions: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          kycRecords: true,
          agent: true,
          leaderboard: true,
          referralsGiven: {
            include: {
              referredUser: {
                select: {
                  firstName: true,
                  lastName: true,
                  totalCyclesCompleted: true,
                },
              },
            },
          },
        },
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
        mockResponse as any,
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
    it('should ban user successfully with reason', async () => {
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
        mockResponse as any,
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

    it('should handle database errors during ban operation', async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = { reason: 'Test ban' };

      await adminController.banUser(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('unbanUser', () => {
    it('should unban user successfully', async () => {
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
        mockResponse as any,
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

  describe('createUser', () => {
    it('should create a new user successfully with temp password', async () => {
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
        mockResponse as any,
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
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User with this phone number or email already exists',
          statusCode: 409,
        })
      );
    });

    it('should reject duplicate email', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
      });

      mockRequest.body = {
        phoneNumber: '+0987654321',
        email: 'existing@example.com',
        firstName: 'New',
        lastName: 'User',
      };

      await adminController.createUser(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User with this phone number or email already exists',
          statusCode: 409,
        })
      );
    });

    it('should use default values for optional fields', async () => {
      const mockNewUser = {
        id: 'new-user-id',
        phoneNumber: '+1234567890',
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
        firstName: 'New',
        lastName: 'User',
        // No email, role, tier, isActive specified
      };

      await adminController.createUser(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phoneNumber: '+1234567890',
          firstName: 'New',
          lastName: 'User',
          role: 'beginner', // default
          tier: 1, // default
          isActive: true, // default
          passwordHash: 'hashed_password',
          kycStatus: 'not_required',
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('updateUser', () => {
    it('should update user details successfully', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        locationCity: 'Lagos',
        locationState: 'Lagos',
        isActive: true,
        trustScore: 4.5,
        tier: 2,
      };

      const mockUpdatedUser = {
        ...mockUser,
        firstName: 'Johnny',
        trustScore: 4.8,
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        firstName: 'Johnny',
        trustScore: 4.8,
      };

      await adminController.updateUser(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          firstName: 'Johnny',
          trustScore: 4.8,
        },
        select: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User updated successfully',
        data: mockUpdatedUser,
      });
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { userId: 'non-existent' };
      mockRequest.body = { firstName: 'Updated' };

      await adminController.updateUser(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
          statusCode: 404,
        })
      );
    });

    it('should handle partial updates correctly', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isActive: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: 'johnny@example.com',
        updatedAt: new Date(),
      });

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        email: 'johnny@example.com',
        // Other fields not specified should not be updated
      };

      await adminController.updateUser(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          email: 'johnny@example.com',
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
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
        isBanned: true,
        banReason: 'Deactivated by admin admin-id',
      });

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = { reason: 'Account closure request' };

      await adminController.deleteUser(
        mockRequest as AuthRequest,
        mockResponse as any,
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

    it('should reject deletion of already deactivated user', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        isActive: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };

      await adminController.deleteUser(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User is already deactivated',
          statusCode: 400,
        })
      );
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { userId: 'non-existent' };

      await adminController.deleteUser(
        mockRequest as AuthRequest,
        mockResponse as any,
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

  describe('getUserPermissions', () => {
    it('should return user permissions for agent role', async () => {
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
        mockResponse as any,
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

    it('should return user permissions for beginner role', async () => {
      const mockUser = {
        id: 'user-1',
        role: 'beginner',
        tier: 1,
        kycStatus: 'pending',
        trustScore: 3.0,
        isActive: true,
        isBanned: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };

      await adminController.getUserPermissions(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          role: 'beginner',
          tier: 1,
          rolePermissions: expect.arrayContaining([
            'donate',
            'receive',
            'view_profile',
          ]),
          tierPermissions: ['basic_donations'],
        }),
      });
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { userId: 'non-existent' };

      await adminController.getUserPermissions(
        mockRequest as AuthRequest,
        mockResponse as any,
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
        mockResponse as any,
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

    it('should return 404 for non-existent transaction', async () => {
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { transactionId: 'non-existent' };
      mockRequest.body = { status: 'completed' };

      await adminController.overrideDonation(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Transaction not found',
          statusCode: 404,
        })
      );
    });

    it('should validate status parameter', async () => {
      mockRequest.params = { transactionId: 'transaction-1' };
      mockRequest.body = {
        status: 'invalid_status',
        reason: 'Test',
      };

      await adminController.overrideDonation(
        mockRequest as AuthRequest,
        mockResponse as any,
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
});