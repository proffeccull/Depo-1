/* eslint-disable @typescript-eslint/no-explicit-any */
import '@types/jest';
import * as adminAdvancedController from '../src/controllers/adminAdvanced.controller';
import prisma from '../src/utils/prisma';
import { AuthRequest } from '../src/middleware/auth';

// Mock dependencies
jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    agent: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    match: {
      update: jest.fn(),
    },
    adminAction: {
      create: jest.fn(),
    },
    leaderboard: {
      updateMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../src/services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/featureFlags.service', () => ({
  getAllFeatureFlags: jest.fn(),
  toggleFeature: jest.fn(),
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Admin Advanced Controller', () => {
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

  describe('promoteToAgent', () => {
    it('should promote user to agent successfully', async () => {
      const mockUser = {
        id: 'user-1',
        role: 'beginner',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockUpdatedUser = {
        ...mockUser,
        role: 'agent',
      };

      const mockAgent = {
        id: 'agent-1',
        userId: 'user-1',
        agentCode: 'AG123456',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (prisma.agent.create as jest.Mock).mockResolvedValue(mockAgent);

      mockRequest.params = { userId: 'user-1' };

      await adminAdvancedController.promoteToAgent(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'agent' },
      });

      expect(prisma.agent.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          agentCode: expect.stringMatching(/^AG\d{6}$/),
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User promoted to agent successfully',
        data: {
          userId: 'user-1',
          role: 'agent',
          agentCode: expect.any(String),
        },
      });
    });

    it('should reject promotion of already agent user', async () => {
      const mockUser = {
        id: 'user-1',
        role: 'agent',
        firstName: 'John',
        lastName: 'Doe',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };

      await adminAdvancedController.promoteToAgent(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User is already an agent',
          statusCode: 400,
        })
      );
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { userId: 'non-existent' };

      await adminAdvancedController.promoteToAgent(
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

  describe('promoteInMatchQueue', () => {
    it('should promote user in match queue with max priority', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        recipientMatches: [
          {
            id: 'match-1',
            matchedAt: new Date(),
            priorityScore: 1,
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };

      await adminAdvancedController.promoteInMatchQueue(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.match.update).toHaveBeenCalledWith({
        where: { id: 'match-1' },
        data: {
          priorityScore: 999,
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User promoted to top of match queue',
        data: {
          userId: 'user-1',
          priorityScore: 999,
        },
      });
    });

    it('should handle user with no pending matches', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        recipientMatches: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.params = { userId: 'user-1' };

      await adminAdvancedController.promoteInMatchQueue(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('User has no pending matches'),
          statusCode: 400,
        })
      );
    });
  });

  describe('sendCoins', () => {
    it('should send coins to user successfully', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        charityCoinsBalance: 100,
      };

      const mockUpdatedUser = {
        ...mockUser,
        charityCoinsBalance: 250,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      mockRequest.body = {
        userId: 'user-1',
        amount: 150,
        reason: 'Bonus for participation',
      };

      await adminAdvancedController.sendCoins(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          charityCoinsBalance: { increment: 150 },
        },
        select: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '150 coins sent to John Doe',
        data: {
          userId: 'user-1',
          coinsSent: 150,
          newBalance: 250,
          reason: 'Bonus for participation',
        },
      });
    });

    it('should reject invalid coin amounts', async () => {
      mockRequest.body = {
        userId: 'user-1',
        amount: -50,
        reason: 'Test',
      };

      await adminAdvancedController.sendCoins(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid coin amount (1-100,000)',
          statusCode: 400,
        })
      );
    });

    it('should reject amounts over maximum limit', async () => {
      mockRequest.body = {
        userId: 'user-1',
        amount: 150000,
        reason: 'Test',
      };

      await adminAdvancedController.sendCoins(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid coin amount (1-100,000)',
          statusCode: 400,
        })
      );
    });

    it('should reject zero amount', async () => {
      mockRequest.body = {
        userId: 'user-1',
        amount: 0,
        reason: 'Test',
      };

      await adminAdvancedController.sendCoins(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid coin amount (1-100,000)',
          statusCode: 400,
        })
      );
    });

    it('should handle database errors', async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      mockRequest.body = {
        userId: 'user-1',
        amount: 100,
        reason: 'Test',
      };

      await adminAdvancedController.sendCoins(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('sendBulkEmail', () => {
    it('should send bulk email successfully', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          firstName: 'John',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          firstName: 'Jane',
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      mockRequest.body = {
        subject: 'Important Update',
        body: 'Hello {firstName}, welcome to our platform!',
        filters: { role: 'beginner' },
      };

      await adminAdvancedController.sendBulkEmail(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          email: { not: null },
          role: 'beginner',
        },
        select: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Bulk email sent',
        data: {
          totalRecipients: 2,
          sent: 2,
          failed: 0,
        },
      });
    });

    it('should handle email sending failures', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          firstName: 'John',
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Mock email service to fail
      const { sendEmail } = require('../src/services/email.service');
      sendEmail.mockRejectedValue(new Error('SMTP error'));

      mockRequest.body = {
        subject: 'Test',
        body: 'Hello {firstName}!',
        filters: {},
      };

      await adminAdvancedController.sendBulkEmail(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Bulk email sent',
        data: {
          totalRecipients: 1,
          sent: 0,
          failed: 1,
        },
      });
    });

    it('should reject when no users match filters', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      mockRequest.body = {
        subject: 'Test',
        body: 'Hello!',
        filters: { role: 'nonexistent' },
      };

      await adminAdvancedController.sendBulkEmail(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No users match the filters',
          statusCode: 400,
        })
      );
    });
  });

  describe('sendSingleEmail', () => {
    it('should send single email successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user1@example.com',
        firstName: 'John',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.body = {
        userId: 'user-1',
        subject: 'Personal Message',
        body: 'Hello {firstName}, this is a personal message.',
      };

      await adminAdvancedController.sendSingleEmail(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Email sent successfully',
        data: {
          userId: 'user-1',
          email: 'user1@example.com',
        },
      });
    });

    it('should reject when user has no email', async () => {
      const mockUser = {
        id: 'user-1',
        email: null,
        firstName: 'John',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      mockRequest.body = {
        userId: 'user-1',
        subject: 'Test',
        body: 'Hello!',
      };

      await adminAdvancedController.sendSingleEmail(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found or has no email',
          statusCode: 404,
        })
      );
    });
  });

  describe('getFeatureFlags', () => {
    it('should return all feature flags', async () => {
      const mockFlags = [
        { name: 'new_ui', enabled: true },
        { name: 'beta_feature', enabled: false },
      ];

      const { getAllFeatureFlags } = require('../src/services/featureFlags.service');
      getAllFeatureFlags.mockResolvedValue(mockFlags);

      await adminAdvancedController.getFeatureFlags(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          flags: mockFlags,
          total: 2,
        },
      });
    });
  });

  describe('toggleFeatureFlag', () => {
    it('should toggle feature flag successfully', async () => {
      const { toggleFeature } = require('../src/services/featureFlags.service');
      toggleFeature.mockResolvedValue(undefined);

      mockRequest.body = {
        featureName: 'new_ui',
        isEnabled: false,
      };

      await adminAdvancedController.toggleFeatureFlag(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(toggleFeature).toHaveBeenCalledWith('new_ui', false, 'admin-id');

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Feature \'new_ui\' disabled',
        data: {
          featureName: 'new_ui',
          isEnabled: false,
        },
      });
    });
  });

  describe('getAdminActionLogs', () => {
    it('should return admin action logs with pagination', async () => {
      const mockActions = [
        {
          id: 'action-1',
          action: 'promote_to_agent',
          createdAt: new Date(),
          admin: {
            id: 'admin-id',
            firstName: 'Admin',
            lastName: 'User',
            role: 'csc_council',
          },
          target: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      ];

      (prisma.adminAction.findMany as jest.Mock).mockResolvedValue(mockActions);

      mockRequest.query = { limit: '50', actionType: 'promote_to_agent' };

      await adminAdvancedController.getAdminActionLogs(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.adminAction.findMany).toHaveBeenCalledWith({
        where: { action: 'promote_to_agent' },
        take: 50,
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          actions: mockActions,
          total: 1,
        },
      });
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'beginner',
      };

      const mockUpdatedUser = {
        ...mockUser,
        role: 'power_partner',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = { role: 'power_partner' };

      await adminAdvancedController.updateUserRole(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'power_partner' },
        select: expect.any(Object),
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User role updated successfully',
        data: mockUpdatedUser,
      });
    });

    it('should reject invalid role', async () => {
      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = { role: 'invalid_role' };

      await adminAdvancedController.updateUserRole(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid role'),
          statusCode: 400,
        })
      );
    });
  });

  describe('resetLeaderboard', () => {
    it('should reset leaderboard successfully', async () => {
      const mockLeaderboardStats = [
        { userId: 'user-1', totalScore: 150, rank: 1 },
        { userId: 'user-2', totalScore: 120, rank: 2 },
      ];

      (prisma.leaderboard.findMany as jest.Mock).mockResolvedValue(mockLeaderboardStats);

      mockRequest.body = { reason: 'Monthly reset' };

      await adminAdvancedController.resetLeaderboard(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.leaderboard.updateMany).toHaveBeenCalledWith({
        data: {
          totalScore: 0,
          rank: null,
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Leaderboard reset successfully',
        data: {
          affectedUsers: 2,
          reason: 'Monthly reset',
        },
      });
    });
  });

  describe('adjustLeaderboardScore', () => {
    it('should adjust leaderboard score successfully', async () => {
      const mockEntry = {
        totalScore: 100,
        rank: 5,
      };

      (prisma.leaderboard.findUnique as jest.Mock).mockResolvedValue(mockEntry);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        scoreAdjustment: 50,
        reason: 'Bonus points',
      };

      await adminAdvancedController.adjustLeaderboardScore(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.leaderboard.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          totalScore: 150, // 100 + 50
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Leaderboard score adjusted successfully',
        data: {
          userId: 'user-1',
          oldScore: 100,
          scoreAdjustment: 50,
          newScore: 150,
          reason: 'Bonus points',
        },
      });
    });

    it('should prevent negative scores', async () => {
      const mockEntry = {
        totalScore: 30,
        rank: 10,
      };

      (prisma.leaderboard.findUnique as jest.Mock).mockResolvedValue(mockEntry);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        scoreAdjustment: -50,
        reason: 'Penalty',
      };

      await adminAdvancedController.adjustLeaderboardScore(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(prisma.leaderboard.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          totalScore: 0, // Math.max(0, 30 + (-50))
        },
      });
    });

    it('should return 404 for user not in leaderboard', async () => {
      (prisma.leaderboard.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { userId: 'user-1' };
      mockRequest.body = {
        scoreAdjustment: 10,
        reason: 'Test',
      };

      await adminAdvancedController.adjustLeaderboardScore(
        mockRequest as AuthRequest,
        mockResponse as any,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found in leaderboard',
          statusCode: 404,
        })
      );
    });
  });
});