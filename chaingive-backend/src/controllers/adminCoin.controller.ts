import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Get all pending coin purchase requests
 */
export const getPendingPurchases = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [purchases, total] = await Promise.all([
      prisma.coinPurchaseFromAdmin.findMany({
        where: {
          status: { in: ['pending', 'verifying'] },
        },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: {
              agentCode: true,
              userId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
      }),
      prisma.coinPurchaseFromAdmin.count({
        where: { status: { in: ['pending', 'verifying'] } },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        purchases,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all coin purchase requests (with filters)
 */
export const getAllPurchases = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 50, offset = 0, status, agentCode } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (agentCode) {
      where.agent = { agentCode };
    }

    const [purchases, total] = await Promise.all([
      prisma.coinPurchaseFromAdmin.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: {
              agentCode: true,
              coinBalance: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
      }),
      prisma.coinPurchaseFromAdmin.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        purchases,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve coin purchase and credit agent
 */
export const approvePurchase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const { purchaseId } = req.params;
    const { notes } = req.body;

    // Find purchase
    const purchase = await prisma.coinPurchaseFromAdmin.findUnique({
      where: { id: purchaseId },
      include: { agent: true },
    });

    if (!purchase) {
      throw new AppError('Purchase not found', 404, 'PURCHASE_NOT_FOUND');
    }

    if (purchase.status === 'confirmed') {
      throw new AppError('Purchase already approved', 400, 'ALREADY_APPROVED');
    }

    if (purchase.status === 'rejected') {
      throw new AppError('Cannot approve rejected purchase', 400, 'ALREADY_REJECTED');
    }

    if (!purchase.txHash) {
      throw new AppError('No transaction hash provided', 400, 'MISSING_TX_HASH');
    }

    // Approve and credit agent in transaction
    await prisma.$transaction([
      // Update purchase status
      prisma.coinPurchaseFromAdmin.update({
        where: { id: purchaseId },
        data: {
          status: 'confirmed',
          adminApprovedBy: adminId,
          approvedAt: new Date(),
          notes,
        },
      }),
      // Credit agent's coin balance
      prisma.agent.update({
        where: { id: purchase.agentId },
        data: {
          coinBalance: { increment: purchase.quantity },
          totalCoinsStocked: { increment: purchase.quantity },
        },
      }),
    ]);

    logger.info(
      `Admin ${adminId} approved purchase ${purchaseId}, credited ${purchase.quantity} coins to agent ${purchase.agent.agentCode}`
    );

    // TODO: Send notification to agent (requires notification service integration)
    // await sendPushNotification(
    //   purchase.agent.userId,
    //   'Coin Purchase Approved',
    //   `Your purchase of ${purchase.quantity} coins has been approved!`
    // );

    res.status(200).json({
      success: true,
      message: 'Purchase approved and agent credited',
      data: {
        purchaseId,
        quantity: purchase.quantity,
        agentCode: purchase.agent.agentCode,
        newBalance: purchase.agent.coinBalance + purchase.quantity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject coin purchase
 */
export const rejectPurchase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const { purchaseId } = req.params;
    const { rejectionReason } = req.body;

    // Find purchase
    const purchase = await prisma.coinPurchaseFromAdmin.findUnique({
      where: { id: purchaseId },
      include: { agent: true },
    });

    if (!purchase) {
      throw new AppError('Purchase not found', 404, 'PURCHASE_NOT_FOUND');
    }

    if (purchase.status === 'confirmed') {
      throw new AppError('Cannot reject approved purchase', 400, 'ALREADY_APPROVED');
    }

    if (purchase.status === 'rejected') {
      throw new AppError('Purchase already rejected', 400, 'ALREADY_REJECTED');
    }

    // Reject purchase
    await prisma.coinPurchaseFromAdmin.update({
      where: { id: purchaseId },
      data: {
        status: 'rejected',
        adminApprovedBy: adminId,
        rejectionReason,
      },
    });

    logger.info(
      `Admin ${adminId} rejected purchase ${purchaseId} for agent ${purchase.agent.agentCode}`
    );

    // TODO: Send notification to agent (requires notification service integration)
    // await sendPushNotification(
    //   purchase.agent.userId,
    //   'Coin Purchase Rejected',
    //   `Your purchase request was rejected: ${rejectionReason}`
    // );

    res.status(200).json({
      success: true,
      message: 'Purchase rejected',
      data: {
        purchaseId,
        rejectionReason,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get crypto wallet addresses
 */
export const getCryptoWallets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallets = await prisma.cryptoWallet.findMany({
      where: { isActive: true },
      orderBy: { currency: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: { wallets },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create crypto wallet address
 */
export const createCryptoWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const { currency, network, address, qrCodeUrl } = req.body;

    // Check if wallet already exists
    const existing = await prisma.cryptoWallet.findFirst({
      where: { address },
    });

    if (existing) {
      throw new AppError('Wallet address already exists', 409, 'WALLET_EXISTS');
    }

    const wallet = await prisma.cryptoWallet.create({
      data: {
        currency,
        network,
        address,
        qrCodeUrl,
        createdBy: adminId,
      },
    });

    logger.info(`Admin ${adminId} created crypto wallet: ${currency} on ${network}`);

    res.status(201).json({
      success: true,
      message: 'Crypto wallet created',
      data: { wallet },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate crypto wallet
 */
export const deactivateCryptoWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { walletId } = req.params;

    await prisma.cryptoWallet.update({
      where: { id: walletId },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: 'Crypto wallet deactivated',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get platform coin statistics
 */
export const getCoinStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalAgentCoins,
      totalUserCoins,
      totalPurchases,
      totalSales,
      pendingPurchases,
    ] = await Promise.all([
      // Total coins held by all agents
      prisma.agent.aggregate({
        _sum: { coinBalance: true },
      }),
      // Total coins held by all users
      prisma.user.aggregate({
        _sum: { charityCoinsBalance: true },
      }),
      // Total coins purchased from admin
      prisma.coinPurchaseFromAdmin.aggregate({
        where: { status: 'confirmed' },
        _sum: { quantity: true },
        _count: true,
      }),
      // Total coins sold to users
      prisma.coinSaleToUser.aggregate({
        _sum: { quantity: true, platformRevenue: true, agentCommission: true },
        _count: true,
      }),
      // Pending purchase requests
      prisma.coinPurchaseFromAdmin.count({
        where: { status: { in: ['pending', 'verifying'] } },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAgentCoins: totalAgentCoins._sum.coinBalance || 0,
        totalUserCoins: totalUserCoins._sum.charityCoinsBalance || 0,
        totalCoinsIssued: totalPurchases._sum.quantity || 0,
        totalCoinsSold: totalSales._sum.quantity || 0,
        totalPurchases: totalPurchases._count,
        totalSales: totalSales._count,
        platformRevenue: totalSales._sum.platformRevenue || 0,
        agentCommissions: totalSales._sum.agentCommission || 0,
        pendingPurchaseRequests: pendingPurchases,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mint coins to agent (admin override)
 */
export const mintCoinsToAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { agentId } = req.params;
    const { amount, reason } = req.body;
    const adminId = req.user!.id;

    if (amount <= 0 || amount > 1000000) {
      throw new AppError('Invalid mint amount (1-1,000,000)', 400, 'INVALID_AMOUNT');
    }

    // Get agent current balance
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        agentCode: true,
        coinBalance: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    // Mint coins to agent
    const newBalance = agent.coinBalance + amount;
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        coinBalance: newBalance,
        totalCoinsStocked: { increment: amount },
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'mint_coins_to_agent',
        targetId: agentId,
        details: JSON.stringify({
          amount,
          oldBalance: agent.coinBalance,
          newBalance,
          reason,
          minted: true
        })
      }
    });

    logger.warn(`Admin ${adminId} minted ${amount} coins to agent ${agent.agentCode}. New balance: ${newBalance}`);

    res.status(200).json({
      success: true,
      message: `Successfully minted ${amount} coins to agent`,
      data: {
        agentId,
        agentCode: agent.agentCode,
        agentName: `${agent.user.firstName} ${agent.user.lastName}`,
        coinsMinted: amount,
        oldBalance: agent.coinBalance,
        newBalance,
        reason
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Burn coins from agent (admin override)
 */
export const burnCoinsFromAgent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { agentId } = req.params;
    const { amount, reason } = req.body;
    const adminId = req.user!.id;

    if (amount <= 0) {
      throw new AppError('Invalid burn amount (must be positive)', 400, 'INVALID_AMOUNT');
    }

    // Get agent current balance
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        agentCode: true,
        coinBalance: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    if (agent.coinBalance < amount) {
      throw new AppError('Insufficient coin balance for burn operation', 400, 'INSUFFICIENT_BALANCE');
    }

    // Burn coins from agent
    const newBalance = agent.coinBalance - amount;
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        coinBalance: newBalance,
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'burn_coins_from_agent',
        targetId: agentId,
        details: JSON.stringify({
          amount,
          oldBalance: agent.coinBalance,
          newBalance,
          reason,
          burned: true
        })
      }
    });

    logger.warn(`Admin ${adminId} burned ${amount} coins from agent ${agent.agentCode}. New balance: ${newBalance}`);

    res.status(200).json({
      success: true,
      message: `Successfully burned ${amount} coins from agent`,
      data: {
        agentId,
        agentCode: agent.agentCode,
        agentName: `${agent.user.firstName} ${agent.user.lastName}`,
        coinsBurned: amount,
        oldBalance: agent.coinBalance,
        newBalance,
        reason
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transfer coins between agents (admin override)
 */
export const transferCoinsBetweenAgents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fromAgentId, toAgentId, amount, reason } = req.body;
    const adminId = req.user!.id;

    if (amount <= 0) {
      throw new AppError('Invalid transfer amount (must be positive)', 400, 'INVALID_AMOUNT');
    }

    if (fromAgentId === toAgentId) {
      throw new AppError('Cannot transfer coins to the same agent', 400, 'SAME_AGENT');
    }

    // Get both agents
    const [fromAgent, toAgent] = await Promise.all([
      prisma.agent.findUnique({
        where: { id: fromAgentId },
        select: {
          id: true,
          agentCode: true,
          coinBalance: true,
          user: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.agent.findUnique({
        where: { id: toAgentId },
        select: {
          id: true,
          agentCode: true,
          coinBalance: true,
          user: { select: { firstName: true, lastName: true } }
        }
      })
    ]);

    if (!fromAgent || !toAgent) {
      throw new AppError('One or both agents not found', 404, 'AGENT_NOT_FOUND');
    }

    if (fromAgent.coinBalance < amount) {
      throw new AppError('Insufficient coin balance for transfer', 400, 'INSUFFICIENT_BALANCE');
    }

    // Transfer coins in transaction
    await prisma.$transaction([
      prisma.agent.update({
        where: { id: fromAgentId },
        data: { coinBalance: { decrement: amount } }
      }),
      prisma.agent.update({
        where: { id: toAgentId },
        data: { coinBalance: { increment: amount } }
      })
    ]);

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'transfer_coins_between_agents',
        details: JSON.stringify({
          fromAgentId,
          toAgentId,
          amount,
          fromAgentCode: fromAgent.agentCode,
          toAgentCode: toAgent.agentCode,
          fromOldBalance: fromAgent.coinBalance,
          toOldBalance: toAgent.coinBalance,
          fromNewBalance: fromAgent.coinBalance - amount,
          toNewBalance: toAgent.coinBalance + amount,
          reason,
          transferred: true
        })
      }
    });

    logger.warn(`Admin ${adminId} transferred ${amount} coins from agent ${fromAgent.agentCode} to ${toAgent.agentCode}`);

    res.status(200).json({
      success: true,
      message: `Successfully transferred ${amount} coins between agents`,
      data: {
        fromAgent: {
          id: fromAgentId,
          code: fromAgent.agentCode,
          name: `${fromAgent.user.firstName} ${fromAgent.user.lastName}`,
          oldBalance: fromAgent.coinBalance,
          newBalance: fromAgent.coinBalance - amount
        },
        toAgent: {
          id: toAgentId,
          code: toAgent.agentCode,
          name: `${toAgent.user.firstName} ${toAgent.user.lastName}`,
          oldBalance: toAgent.coinBalance,
          newBalance: toAgent.coinBalance + amount
        },
        amount,
        reason
      }
    });
  } catch (error) {
    next(error);
  }
};
