import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Get agent's coin inventory and stats
 */
export const getCoinInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const agent = await prisma.agent.findUnique({
      where: { userId },
      select: {
        coinBalance: true,
        totalCoinsStocked: true,
        totalCoinsSold: true,
        lifetimeRevenue: true,
        agentCode: true,
      },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: {
        coinBalance: agent.coinBalance,
        totalCoinsStocked: agent.totalCoinsStocked,
        totalCoinsSold: agent.totalCoinsSold,
        lifetimeRevenue: agent.lifetimeRevenue,
        agentCode: agent.agentCode,
        lowStock: agent.coinBalance < 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request to purchase coins from admin (crypto payment)
 */
export const requestCoinPurchase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { quantity, cryptocurrency, cryptoNetwork } = req.body;

    // Find agent
    const agent = await prisma.agent.findUnique({
      where: { userId },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    if (!agent.isActive) {
      throw new AppError('Agent account is suspended', 403, 'AGENT_SUSPENDED');
    }

    // Get active crypto wallet for this currency/network
    const cryptoWallet = await prisma.cryptoWallet.findFirst({
      where: {
        currency: cryptocurrency,
        network: cryptoNetwork,
        isActive: true,
      },
    });

    if (!cryptoWallet) {
      throw new AppError(
        `No active wallet found for ${cryptocurrency} on ${cryptoNetwork}`,
        400,
        'WALLET_NOT_AVAILABLE'
      );
    }

    // Calculate pricing (admin sets base price)
    const pricePerCoin = 0.10; // $0.10 per coin (can be made configurable)
    const totalAmount = quantity * pricePerCoin;

    // Create purchase request
    const purchase = await prisma.coinPurchaseFromAdmin.create({
      data: {
        agentId: agent.id,
        quantity,
        pricePerCoin,
        totalAmount,
        cryptocurrency,
        cryptoNetwork,
        paymentAddress: cryptoWallet.address,
        status: 'pending',
      },
    });

    logger.info(`Coin purchase requested: ${purchase.id} by agent ${agent.agentCode}`);

    res.status(201).json({
      success: true,
      message: 'Coin purchase request created',
      data: {
        purchaseId: purchase.id,
        quantity,
        pricePerCoin,
        totalAmount,
        cryptocurrency,
        cryptoNetwork,
        paymentAddress: cryptoWallet.address,
        qrCodeUrl: cryptoWallet.qrCodeUrl,
        instructions: [
          `1. Send exactly ${totalAmount} ${cryptocurrency} to the address above`,
          `2. Use ${cryptoNetwork} network`,
          `3. Copy the transaction hash after sending`,
          `4. Submit the transaction hash using the /submit-payment-proof endpoint`,
          `5. Wait for admin approval (usually within 24 hours)`,
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit payment proof for coin purchase
 */
export const submitPaymentProof = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { purchaseId, txHash, txProofUrl } = req.body;

    // Find agent
    const agent = await prisma.agent.findUnique({
      where: { userId },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    // Find purchase
    const purchase = await prisma.coinPurchaseFromAdmin.findFirst({
      where: {
        id: purchaseId,
        agentId: agent.id,
      },
    });

    if (!purchase) {
      throw new AppError('Purchase request not found', 404, 'PURCHASE_NOT_FOUND');
    }

    if (purchase.status !== 'pending') {
      throw new AppError(
        `Cannot submit proof for purchase with status: ${purchase.status}`,
        400,
        'INVALID_STATUS'
      );
    }

    // Update with payment proof
    await prisma.coinPurchaseFromAdmin.update({
      where: { id: purchaseId },
      data: {
        txHash,
        txProofUrl,
        status: 'verifying',
      },
    });

    logger.info(`Payment proof submitted for purchase: ${purchaseId}`);

    res.status(200).json({
      success: true,
      message: 'Payment proof submitted. Waiting for admin verification.',
      data: {
        purchaseId,
        status: 'verifying',
        estimatedApprovalTime: '24 hours',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get coin purchase history
 */
export const getPurchaseHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { limit = 20, offset = 0, status } = req.query;

    const agent = await prisma.agent.findUnique({
      where: { userId },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    const where: any = { agentId: agent.id };
    if (status) {
      where.status = status;
    }

    const [purchases, total] = await Promise.all([
      prisma.coinPurchaseFromAdmin.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
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
 * Sell coins to a user
 */
export const sellCoinsToUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { userPhone, quantity, pricePerCoin, paymentMethod, paymentProof } = req.body;

    // Find agent
    const agent = await prisma.agent.findUnique({
      where: { userId },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    if (!agent.isActive) {
      throw new AppError('Agent account is suspended', 403, 'AGENT_SUSPENDED');
    }

    // Check agent has enough coins
    if (agent.coinBalance < quantity) {
      throw new AppError('Insufficient coin balance', 400, 'INSUFFICIENT_COINS', {
        required: quantity,
        available: agent.coinBalance,
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber: userPhone },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Calculate amounts
    const basePriceNaira = 50; // Base platform price: ₦50/coin
    const totalAmount = pricePerCoin * quantity;

    // Agent can markup up to 10%
    const maxPricePerCoin = basePriceNaira * 1.10;
    if (pricePerCoin > maxPricePerCoin) {
      throw new AppError(
        `Price per coin cannot exceed ₦${maxPricePerCoin}`,
        400,
        'PRICE_TOO_HIGH'
      );
    }

    // Calculate commission (agent keeps the markup)
    const platformRevenue = basePriceNaira * quantity;
    const agentCommission = totalAmount - platformRevenue;

    // Execute sale in transaction
    await prisma.$transaction([
      // Create sale record
      prisma.coinSaleToUser.create({
        data: {
          agentId: agent.id,
          userId: user.id,
          quantity,
          pricePerCoin,
          totalAmount,
          paymentMethod,
          paymentProof,
          agentCommission,
          platformRevenue,
        },
      }),
      // Deduct from agent inventory
      prisma.agent.update({
        where: { id: agent.id },
        data: {
          coinBalance: { decrement: quantity },
          totalCoinsSold: { increment: quantity },
          lifetimeRevenue: { increment: agentCommission },
          totalCommissions: { increment: agentCommission },
        },
      }),
      // Credit user
      prisma.user.update({
        where: { id: user.id },
        data: {
          charityCoinsBalance: { increment: quantity },
        },
      }),
    ]);

    logger.info(`Agent ${agent.agentCode} sold ${quantity} coins to user ${user.id}`);

    res.status(201).json({
      success: true,
      message: 'Coins sold successfully',
      data: {
        quantity,
        pricePerCoin,
        totalAmount,
        agentCommission,
        platformRevenue,
        agentNewBalance: agent.coinBalance - quantity,
        userNewBalance: user.charityCoinsBalance + quantity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get coin sales history
 */
export const getSalesHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { limit = 20, offset = 0 } = req.query;

    const agent = await prisma.agent.findUnique({
      where: { userId },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    const [sales, total] = await Promise.all([
      prisma.coinSaleToUser.findMany({
        where: { agentId: agent.id },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
      }),
      prisma.coinSaleToUser.count({ where: { agentId: agent.id } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        sales,
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
