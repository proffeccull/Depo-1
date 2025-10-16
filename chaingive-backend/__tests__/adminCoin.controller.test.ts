/// <reference types="jest" />
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as adminCoinController from '../src/controllers/adminCoin.controller';
import prisma from '../src/utils/prisma';
import { AuthRequest } from '../src/middleware/auth';

// Mock dependencies
jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    coinPurchaseFromAdmin: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
    agent: {
      update: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
    },
    cryptoWallet: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      aggregate: jest.fn(),
    },
    coinSaleToUser: {
      aggregate: jest.fn(),
    },
    transaction: {
      aggregate: jest.fn(),
    },
    adminAction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Admin Coin Controller', () => {
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

  describe('getPendingPurchases', () => {
    it('should return paginated pending purchases', async () => {
      const mockPurchases = [
        {
          id: 'purchase-1',
          quantity: 1000,
          status: 'pending',
          createdAt: new Date(),
          agent: {
            agentCode: 'AG123456',
            userId: 'agent-user-id',
            user: {
              firstName: 'Agent',
              lastName: 'User',
              phoneNumber: '+1234567890',
            },
          },
        },
      ];

      (prisma.coinPurchaseFromAdmin.findMany as jest.Mock).mockResolvedValue(mockPurchases);
      (prisma.coinPurchaseFromAdmin.count as jest.Mock).mockResolvedValue(1);

      mockRequest.query = { limit: '10', offset: '0' };

      await adminCoinController.getPendingPurchases(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.coinPurchaseFromAdmin.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['pending', 'verifying'] },
        },
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          purchases: mockPurchases,
          pagination: {
            total: 1,
            limit: 10,
            offset: 0,
          },
        },
      });
    });
  });

  describe('getAllPurchases', () => {
    it('should return all purchases with filters', async () => {
      const mockPurchases = [
        {
          id: 'purchase-1',
          quantity: 500,
          status: 'confirmed',
          agent: {
            agentCode: 'AG123456',
            coinBalance: 1500,
            user: {
              firstName: 'Agent',
              lastName: 'User',
              phoneNumber: '+1234567890',
            },
          },
        },
      ];

      (prisma.coinPurchaseFromAdmin.findMany as jest.Mock).mockResolvedValue(mockPurchases);
      (prisma.coinPurchaseFromAdmin.count as jest.Mock).mockResolvedValue(1);

      mockRequest.query = { status: 'confirmed', agentCode: 'AG123456' };

      await adminCoinController.getAllPurchases(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.coinPurchaseFromAdmin.findMany).toHaveBeenCalledWith({
        where: {
          status: 'confirmed',
          agent: { agentCode: 'AG123456' },
        },
        take: 50,
        skip: 0,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('approvePurchase', () => {
    it('should approve purchase and credit agent successfully', async () => {
      const mockPurchase = {
        id: 'purchase-1',
        quantity: 1000,
        status: 'pending',
        txHash: '0x123456789',
        agentId: 'agent-1',
        agent: {
          agentCode: 'AG123456',
          coinBalance: 500,
        },
      };

      (prisma.coinPurchaseFromAdmin.findUnique as jest.Mock).mockResolvedValue(mockPurchase);
      (prisma.$transaction as jest.Mock).mockResolvedValue(undefined);

      mockRequest.params = { purchaseId: 'purchase-1' };
      mockRequest.body = { notes: 'Approved via admin panel' };

      await adminCoinController.approvePurchase(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.$transaction).toHaveBeenCalledWith([
        expect.objectContaining({
          where: { id: 'purchase-1' },
          data: expect.objectContaining({
            status: 'confirmed',
            adminApprovedBy: 'admin-id',
            approvedAt: expect.any(Date),
            notes: 'Approved via admin panel',
          }),
        }),
        expect.objectContaining({
          where: { id: 'agent-1' },
          data: expect.objectContaining({
            coinBalance: { increment: 1000 },
            totalCoinsStocked: { increment: 1000 },
          }),
        }),
      ]);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Purchase approved and agent credited',
        data: {
          purchaseId: 'purchase-1',
          quantity: 1000,
          agentCode: 'AG123456',
          newBalance: 1500, // 500 + 1000
        },
      });
    });

    it('should reject approval of already approved purchase', async () => {
      const mockPurchase = {
        id: 'purchase-1',
        quantity: 1000,
        status: 'confirmed',
        agent: { agentCode: 'AG123456' },
      };

      (prisma.coinPurchaseFromAdmin.findUnique as jest.Mock).mockResolvedValue(mockPurchase);

      mockRequest.params = { purchaseId: 'purchase-1' };

      await adminCoinController.approvePurchase(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Purchase already approved',
          statusCode: 400,
        })
      );
    });

    it('should reject approval without transaction hash', async () => {
      const mockPurchase = {
        id: 'purchase-1',
        quantity: 1000,
        status: 'pending',
        txHash: null,
        agent: { agentCode: 'AG123456' },
      };

      (prisma.coinPurchaseFromAdmin.findUnique as jest.Mock).mockResolvedValue(mockPurchase);

      mockRequest.params = { purchaseId: 'purchase-1' };

      await adminCoinController.approvePurchase(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No transaction hash provided',
          statusCode: 400,
        })
      );
    });
  });

  describe('rejectPurchase', () => {
    it('should reject purchase successfully', async () => {
      const mockPurchase = {
        id: 'purchase-1',
        quantity: 1000,
        status: 'pending',
        agent: { agentCode: 'AG123456' },
      };

      (prisma.coinPurchaseFromAdmin.findUnique as jest.Mock).mockResolvedValue(mockPurchase);

      mockRequest.params = { purchaseId: 'purchase-1' };
      mockRequest.body = { rejectionReason: 'Invalid transaction' };

      await adminCoinController.rejectPurchase(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.coinPurchaseFromAdmin.update).toHaveBeenCalledWith({
        where: { id: 'purchase-1' },
        data: {
          status: 'rejected',
          adminApprovedBy: 'admin-id',
          rejectionReason: 'Invalid transaction',
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Purchase rejected',
        data: {
          purchaseId: 'purchase-1',
          rejectionReason: 'Invalid transaction',
        },
      });
    });
  });
}); 'Invalid transaction',
        },
      });
    });

    it('should reject rejection of already approved purchase', async () => {
      const mockPurchase = {
        id: 'purchase-1',
        status: 'confirmed',
        agent: { agentCode: 'AG123456' },
      };

      (prisma.coinPurchaseFromAdmin.findUnique as jest.Mock).mockResolvedValue(mockPurchase);

      mockRequest.params = { purchaseId: 'purchase-1' };

      await adminCoinController.rejectPurchase(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cannot reject approved purchase',
          statusCode: 400,
        })
      );
    });
  });

  describe('getCryptoWallets', () => {
    it('should return active crypto wallets', async () => {
      const mockWallets = [
        {
          id: 'wallet-1',
          currency: 'USDT',
          network: 'TRC20',
          address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          isActive: true,
        },
      ];

      (prisma.cryptoWallet.findMany as jest.Mock).mockResolvedValue(mockWallets);

      await adminCoinController.getCryptoWallets(
        mockRequest as Request,
        mockResponse as any,
        mockNext
      );

      expect(prisma.cryptoWallet.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { currency: 'asc' },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { wallets: mockWallets },
      });
    });
  });

  describe('createCryptoWallet', () => {
    it('should create crypto wallet successfully', async () => {
      const mockWallet = {
        id: 'wallet-1',
        currency: 'BTC',
        network: 'BTC',
        address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        qrCodeUrl: 'https://example.com/qr',
        createdBy: 'admin-id',
      };

      (prisma.cryptoWallet.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.cryptoWallet.create as jest.Mock).mockResolvedValue(mockWallet);

      mockRequest.body = {
        currency: 'BTC',
        network: 'BTC',
        address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        qrCodeUrl: 'https://example.com/qr',
      };

      await adminCoinController.createCryptoWallet(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.cryptoWallet.create).toHaveBeenCalledWith({
        data: {
          currency: 'BTC',
          network: 'BTC',
          address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
          qrCodeUrl: 'https://example.com/qr',
          createdBy: 'admin-id',
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Crypto wallet created',
        data: { wallet: mockWallet },
      });
    });

    it('should reject duplicate wallet address', async () => {
      (prisma.cryptoWallet.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-wallet',
        address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      });

      mockRequest.body = {
        currency: 'BTC',
        network: 'BTC',
        address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      };

      await adminCoinController.createCryptoWallet(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Wallet address already exists',
          statusCode: 409,
        })
      );
    });
  });

  describe('getCoinStats', () => {
    it('should return comprehensive coin statistics', async () => {
      const mockStats = {
        totalAgentCoins: { _sum: { coinBalance: 50000 } },
        totalUserCoins: { _sum: { charityCoinsBalance: 25000 } },
        totalPurchases: { _sum: { quantity: 75000 }, _count: 150 },
        totalSales: { _sum: { quantity: 60000, platformRevenue: 300000, agentCommission: 120000 }, _count: 300 },
        pendingPurchases: 5,
      };

      // Mock all aggregate calls
      (prisma.agent.aggregate as jest.Mock).mockResolvedValue(mockStats.totalAgentCoins);
      (prisma.user.aggregate as jest.Mock).mockResolvedValue(mockStats.totalUserCoins);
      (prisma.coinPurchaseFromAdmin.aggregate as jest.Mock).mockResolvedValue(mockStats.totalPurchases);
      (prisma.coinSaleToUser.aggregate as jest.Mock).mockResolvedValue(mockStats.totalSales);
      (prisma.coinPurchaseFromAdmin.count as jest.Mock).mockResolvedValue(mockStats.pendingPurchases);

      await adminCoinController.getCoinStats(
        mockRequest as Request,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalAgentCoins: 50000,
          totalUserCoins: 25000,
          totalCoinsIssued: 75000,
          totalCoinsSold: 60000,
          totalPurchases: 150,
          totalSales: 300,
          platformRevenue: 300000,
          agentCommissions: 120000,
          pendingPurchaseRequests: 5,
        }),
      });
    });
  });

  describe('mintCoinsToAgent', () => {
    it('should mint coins to agent successfully', async () => {
      const mockAgent = {
        id: 'agent-1',
        agentCode: 'AG123456',
        coinBalance: 1000,
        user: {
          firstName: 'Agent',
          lastName: 'User',
        },
      };

      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);

      mockRequest.params = { agentId: 'agent-1' };
      mockRequest.body = {
        amount: 500,
        reason: 'Stock replenishment',
      };

      await adminCoinController.mintCoinsToAgent(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.agent.update).toHaveBeenCalledWith({
        where: { id: 'agent-1' },
        data: {
          coinBalance: 1500, // 1000 + 500
          totalCoinsStocked: { increment: 500 },
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully minted 500 coins to agent',
        data: expect.objectContaining({
          agentId: 'agent-1',
          agentCode: 'AG123456',
          agentName: 'Agent User',
          coinsMinted: 500,
          oldBalance: 1000,
          newBalance: 1500,
          reason: 'Stock replenishment',
        }),
      });
    });

    it('should reject invalid mint amounts', async () => {
      mockRequest.params = { agentId: 'agent-1' };
      mockRequest.body = { amount: -100, reason: 'Test' };

      await adminCoinController.mintCoinsToAgent(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid mint amount (1-1,000,000)',
          statusCode: 400,
        })
      );
    });

    it('should reject amounts over maximum limit', async () => {
      mockRequest.params = { agentId: 'agent-1' };
      mockRequest.body = { amount: 2000000, reason: 'Test' };

      await adminCoinController.mintCoinsToAgent(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid mint amount (1-1,000,000)',
          statusCode: 400,
        })
      );
    });

    it('should return 404 for non-existent agent', async () => {
      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { agentId: 'non-existent' };
      mockRequest.body = { amount: 100, reason: 'Test' };

      await adminCoinController.mintCoinsToAgent(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Agent not found',
          statusCode: 404,
        })
      );
    });

    it('should reject zero amount', async () => {
      mockRequest.params = { agentId: 'agent-1' };
      mockRequest.body = { amount: 0, reason: 'Test' };

      await adminCoinController.mintCoinsToAgent(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid mint amount (1-1,000,000)',
          statusCode: 400,
        })
      );
    });

    it('should handle database errors', async () => {
      (prisma.agent.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      mockRequest.params = { agentId: 'agent-1' };
      mockRequest.body = { amount: 100, reason: 'Test' };

      await adminCoinController.mintCoinsToAgent(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('burnCoinsFromAgent', () => {
    it('should burn coins from agent successfully', async () => {
      const mockAgent = {
        id: 'agent-1',
        agentCode: 'AG123456',
        coinBalance: 1000,
        user: {
          firstName: 'Agent',
          lastName: 'User',
        },
      };

      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);

      mockRequest.params = { agentId: 'agent-1' };
      mockRequest.body = {
        amount: 300,
        reason: 'Stock adjustment',
      };

      await adminCoinController.burnCoinsFromAgent(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.agent.update).toHaveBeenCalledWith({
        where: { id: 'agent-1' },
        data: {
          coinBalance: 700, // 1000 - 300
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully burned 300 coins from agent',
        data: expect.objectContaining({
          agentId: 'agent-1',
          agentCode: 'AG123456',
          agentName: 'Agent User',
          coinsBurned: 300,
          oldBalance: 1000,
          newBalance: 700,
          reason: 'Stock adjustment',
        }),
      });
    });

    it('should reject burn amount exceeding balance', async () => {
      const mockAgent = {
        id: 'agent-1',
        agentCode: 'AG123456',
        coinBalance: 500,
        user: {
          firstName: 'Agent',
          lastName: 'User',
        },
      };

      (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);

      mockRequest.params = { agentId: 'agent-1' };
      mockRequest.body = { amount: 1000, reason: 'Test' };

      await adminCoinController.burnCoinsFromAgent(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient coin balance for burn operation',
          statusCode: 400,
        })
      );
    });
  });

  describe('transferCoinsBetweenAgents', () => {
    it('should transfer coins between agents successfully', async () => {
      const mockFromAgent = {
        id: 'agent-1',
        agentCode: 'AG123456',
        coinBalance: 1000,
        user: { firstName: 'From', lastName: 'Agent' },
      };

      const mockToAgent = {
        id: 'agent-2',
        agentCode: 'AG654321',
        coinBalance: 500,
        user: { firstName: 'To', lastName: 'Agent' },
      };

      (prisma.agent.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockFromAgent)
        .mockResolvedValueOnce(mockToAgent);

      (prisma.$transaction as jest.Mock).mockResolvedValue(undefined);

      mockRequest.body = {
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: 300,
        reason: 'Stock redistribution',
      };

      await adminCoinController.transferCoinsBetweenAgents(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.$transaction).toHaveBeenCalledWith([
        expect.objectContaining({
          where: { id: 'agent-1' },
          data: { coinBalance: { decrement: 300 } },
        }),
        expect.objectContaining({
          where: { id: 'agent-2' },
          data: { coinBalance: { increment: 300 } },
        }),
      ]);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully transferred 300 coins between agents',
        data: expect.objectContaining({
          fromAgent: expect.objectContaining({
            id: 'agent-1',
            code: 'AG123456',
            oldBalance: 1000,
            newBalance: 700,
          }),
          toAgent: expect.objectContaining({
            id: 'agent-2',
            code: 'AG654321',
            oldBalance: 500,
            newBalance: 800,
          }),
          amount: 300,
          reason: 'Stock redistribution',
        }),
      });
    });

    it('should reject transfer to same agent', async () => {
      mockRequest.body = {
        fromAgentId: 'agent-1',
        toAgentId: 'agent-1',
        amount: 100,
        reason: 'Test',
      };

      await adminCoinController.transferCoinsBetweenAgents(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cannot transfer coins to the same agent',
          statusCode: 400,
        })
      );
    });

    it('should reject transfer exceeding sender balance', async () => {
      const mockFromAgent = {
        id: 'agent-1',
        agentCode: 'AG123456',
        coinBalance: 200,
        user: { firstName: 'From', lastName: 'Agent' },
      };

      const mockToAgent = {
        id: 'agent-2',
        agentCode: 'AG654321',
        coinBalance: 500,
        user: { firstName: 'To', lastName: 'Agent' },
      };

      (prisma.agent.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockFromAgent)
        .mockResolvedValueOnce(mockToAgent);

      mockRequest.body = {
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: 500,
        reason: 'Test',
      };

      await adminCoinController.transferCoinsBetweenAgents(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient coin balance for transfer',
          statusCode: 400,
        })
      );
    });
  });
});