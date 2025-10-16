/* eslint-disable @typescript-eslint/no-explicit-any */
import * as adminGodModeController from '../src/controllers/adminGodMode.controller';
import prisma from '../src/utils/prisma';
import { AuthRequest } from '../src/middleware/auth';

// Mock dependencies
jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    transaction: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    escrow: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    adminAction: {
      create: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  },
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Admin God Mode Controller', () => {
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

  describe('overrideTransactionStatus', () => {
    it('should override transaction status successfully', async () => {
      const mockTransaction = {
        id: 'transaction-1',
        amount: 50000,
        status: 'pending',
        escrows: [{ id: 'escrow-1' }],
      };

      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(mockTransaction);

      mockRequest.params = { transactionId: 'transaction-1' };
      mockRequest.body = {
        status: 'completed',
        notes: 'God mode override',
      };

      await adminGodModeController.overrideTransactionStatus(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'transaction-1' },
        data: {
          status: 'completed',
          updatedAt: expect.any(Date),
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Transaction status overridden successfully',
        data: {
          transactionId: 'transaction-1',
          oldStatus: 'pending',
          newStatus: 'completed',
          godModeOverride: true,
        },
      });
    });

    it('should release escrow when completing transaction', async () => {
      const mockTransaction = {
        id: 'transaction-1',
        amount: 50000,
        status: 'pending',
        escrows: [{ id: 'escrow-1' }],
      };

      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(mockTransaction);

      mockRequest.params = { transactionId: 'transaction-1' };
      mockRequest.body = { status: 'completed' };

      await adminGodModeController.overrideTransactionStatus(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.escrow.update).toHaveBeenCalledWith({
        where: { id: 'escrow-1' },
        data: {
          status: 'released',
          releasedAt: expect.any(Date),
        },
      });
    });

    it('should validate status parameter', async () => {
      mockRequest.params = { transactionId: 'transaction-1' };
      mockRequest.body = { status: 'invalid_status' };

      await adminGodModeController.overrideTransactionStatus(
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

    it('should return 404 for non-existent transaction', async () => {
      (prisma.transaction.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { transactionId: 'non-existent' };
      mockRequest.body = { status: 'completed' };

      await adminGodModeController.overrideTransactionStatus(
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
  });

  describe('forceReleaseEscrow', () => {
    it('should force release escrow successfully', async () => {
      const mockEscrow = {
        id: 'escrow-1',
        amount: 50000,
        status: 'holding',
        transaction: {
          id: 'transaction-1',
          status: 'pending',
        },
      };

      (prisma.escrow.findUnique as jest.Mock).mockResolvedValue(mockEscrow);

      mockRequest.params = { escrowId: 'escrow-1' };
      mockRequest.body = { reason: 'Force release required' };

      await adminGodModeController.forceReleaseEscrow(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.escrow.update).toHaveBeenCalledWith({
        where: { id: 'escrow-1' },
        data: {
          status: 'released',
          releasedAt: expect.any(Date),
          releasedBy: 'admin-id',
          notes: 'Force released by admin admin-id',
        },
      });

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'transaction-1' },
        data: {
          status: 'completed',
          notes: 'Escrow force released by admin admin-id',
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Escrow force released successfully',
        data: {
          escrowId: 'escrow-1',
          amount: 50000,
          releasedBy: 'admin-id',
          godModeOverride: true,
        },
      });
    });

    it('should reject force release of already released escrow', async () => {
      const mockEscrow = {
        id: 'escrow-1',
        amount: 50000,
        status: 'released',
      };

      (prisma.escrow.findUnique as jest.Mock).mockResolvedValue(mockEscrow);

      mockRequest.params = { escrowId: 'escrow-1' };

      await adminGodModeController.forceReleaseEscrow(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Escrow already released',
          statusCode: 400,
        })
      );
    });
  });

  describe('overrideUserBalance', () => {
    it('should override wallet balance successfully', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        walletBalance: 100000,
        charityCoinsBalance: 500,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        amount: 50000,
        balanceType: 'wallet',
        reason: 'Balance correction',
      };

      await adminGodModeController.overrideUserBalance(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          walletBalance: { increment: 50000 },
        },
        select: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User balance overridden successfully',
        data: {
          userId: 'user-1',
          balanceType: 'wallet',
          amount: 50000,
          oldBalance: 100000,
          newBalance: 150000,
          godModeOverride: true,
        },
      });
    });

    it('should override coin balance successfully', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        walletBalance: 100000,
        charityCoinsBalance: 500,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        amount: -200,
        balanceType: 'coins',
        reason: 'Coin adjustment',
      };

      await adminGodModeController.overrideUserBalance(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          charityCoinsBalance: { increment: -200 },
        },
        select: expect.any(Object),
      });

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User balance overridden successfully',
        data: expect.objectContaining({
          balanceType: 'coins',
          amount: -200,
          oldBalance: 500,
          newBalance: 300,
        }),
      });
    });

    it('should validate amount range', async () => {
      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        amount: 2000000,
        balanceType: 'wallet',
        reason: 'Test',
      };

      await adminGodModeController.overrideUserBalance(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid amount (-1M to +1M range)',
          statusCode: 400,
        })
      );
    });

    it('should validate balance type', async () => {
      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        amount: 1000,
        balanceType: 'invalid',
        reason: 'Test',
      };

      await adminGodModeController.overrideUserBalance(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid balance type. Use "wallet" or "coins"',
          statusCode: 400,
        })
      );
    });
  });

  describe('overrideUserVerification', () => {
    it('should override user verification successfully', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        tier: 1,
        kycStatus: 'pending',
        trustScore: 3.0,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        tier: 3,
        kycStatus: 'approved',
        trustScore: 4.8,
        reason: 'Verification override',
      };

      await adminGodModeController.overrideUserVerification(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          tier: 3,
          kycStatus: 'approved',
          trustScore: 4.8,
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User verification overridden successfully',
        data: {
          userId: 'user-1',
          oldVerification: {
            tier: 1,
            kycStatus: 'pending',
            trustScore: 3.0,
          },
          newVerification: {
            tier: 3,
            kycStatus: 'approved',
            trustScore: 4.8,
          },
          godModeOverride: true,
        },
      });
    });

    it('should validate tier values', async () => {
      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = { tier: 5, reason: 'Test' };

      await adminGodModeController.overrideUserVerification(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid tier'),
          statusCode: 400,
        })
      );
    });

    it('should validate KYC status values', async () => {
      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = { kycStatus: 'invalid', reason: 'Test' };

      await adminGodModeController.overrideUserVerification(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid KYC status'),
          statusCode: 400,
        })
      );
    });

    it('should validate trust score range', async () => {
      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = { trustScore: 6.0, reason: 'Test' };

      await adminGodModeController.overrideUserVerification(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Trust score must be between 0 and 5',
          statusCode: 400,
        })
      );
    });
  });

  describe('forceDeleteRecord', () => {
    it('should force delete record successfully', async () => {
      const mockRecord = {
        id: 'record-1',
        name: 'Test Record',
        createdAt: new Date(),
      };

      // Mock the dynamic prisma model access
      const mockPrismaModel = {
        findUnique: jest.fn().mockResolvedValue(mockRecord),
        delete: jest.fn().mockResolvedValue(mockRecord),
      };

      (prisma as any).user = mockPrismaModel;

      mockRequest.params = { tableName: 'user', recordId: 'record-1' };
      mockRequest.body = { reason: 'Force delete required' };

      await adminGodModeController.forceDeleteRecord(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockPrismaModel.delete).toHaveBeenCalledWith({
        where: { id: 'record-1' },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Record force deleted successfully',
        data: {
          tableName: 'user',
          recordId: 'record-1',
          deletedRecord: mockRecord,
          godModeOverride: true,
        },
      });
    });

    it('should validate table name', async () => {
      mockRequest.params = { tableName: 'invalid_table', recordId: 'record-1' };

      await adminGodModeController.forceDeleteRecord(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid table'),
          statusCode: 400,
        })
      );
    });

    it('should return 404 for non-existent record', async () => {
      const mockPrismaModel = {
        findUnique: jest.fn().mockResolvedValue(null),
        delete: jest.fn(),
      };

      (prisma as any).user = mockPrismaModel;

      mockRequest.params = { tableName: 'user', recordId: 'non-existent' };

      await adminGodModeController.forceDeleteRecord(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Record not found',
          statusCode: 404,
        })
      );
    });
  });

  describe('executeRawQuery', () => {
    it('should execute raw query successfully', async () => {
      const mockResult = [{ count: 150 }];
      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = {
        query: 'SELECT COUNT(*) as count FROM users',
        params: [],
      };

      await adminGodModeController.executeRawQuery(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM users',
        ...[]
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Raw query executed successfully',
        data: {
          query: 'SELECT COUNT(*) as count FROM users',
          result: mockResult,
          godModeOverride: true,
        },
      });
    });

    it('should reject DML queries', async () => {
      mockRequest.body = {
        query: 'UPDATE users SET active = false',
        params: [],
      };

      await adminGodModeController.executeRawQuery(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Raw queries with DML operations are not allowed',
          statusCode: 403,
        })
      );
    });

    it('should reject empty query', async () => {
      mockRequest.body = { query: '', params: [] };

      await adminGodModeController.executeRawQuery(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Query is required and must be a string',
          statusCode: 400,
        })
      );
    });

    it('should handle query execution errors', async () => {
      (prisma.$queryRawUnsafe as jest.Mock).mockRejectedValue(new Error('Syntax error'));

      mockRequest.body = {
        query: 'SELECT * FROM invalid_table',
        params: [],
      };

      await adminGodModeController.executeRawQuery(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});