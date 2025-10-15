import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Create marketplace listing (Admin only)
 */
export const createListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, coinPrice, category, imageUrl, stockQuantity } = req.body;
    const adminId = req.user!.id;

    const listing = await prisma.marketplaceListing.create({
      data: {
        vendorName: 'Admin',
        itemName: title,
        description,
        category,
        coinPrice,
        imageUrl,
        stockQuantity,
        isInStock: true,
      },
    });

    logger.info(`Admin ${adminId} created marketplace listing: ${listing.id}`);

    res.status(201).json({
      success: true,
      message: 'Marketplace listing created successfully',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update marketplace listing
 */
export const updateListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listingId } = req.params;
    const { title, description, coinPrice, stockQuantity, isAvailable } = req.body;
    const adminId = req.user!.id;

    const listing = await prisma.marketplaceListing.update({
      where: { id: listingId },
      data: {
        ...(title && { itemName: title }),
        ...(description && { description }),
        ...(coinPrice !== undefined && { coinPrice }),
        ...(stockQuantity !== undefined && { 
          stockQuantity,
          isInStock: stockQuantity > 0,
        }),
        ...(isAvailable !== undefined && { isInStock: isAvailable }),
      },
    });

    logger.info(`Admin ${adminId} updated marketplace listing: ${listingId}`);

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete marketplace listing
 */
export const deleteListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listingId } = req.params;
    const adminId = req.user!.id;

    await prisma.marketplaceListing.delete({
      where: { id: listingId },
    });

    logger.info(`Admin ${adminId} deleted marketplace listing: ${listingId}`);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all redemptions (Admin)
 */
export const getAllRedemptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, limit = 50 } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const redemptions = await prisma.redemption.findMany({
      where,
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            email: true,
          },
        },
        listing: {
          select: {
            itemName: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        redemptions,
        total: redemptions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve redemption
 */
export const approveRedemption = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { redemptionId } = req.params;
    const adminId = req.user!.id;

    const redemption = await prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: 'completed',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            firstName: true,
          },
        },
        listing: {
          select: {
            itemName: true,
          },
        },
      },
    });

    logger.info(`Admin ${adminId} approved redemption ${redemptionId}`);

    // Notify user
    // TODO: Send notification (requires notification service integration)

    res.status(200).json({
      success: true,
      message: 'Redemption approved',
      data: redemption,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject redemption
 */
export const rejectRedemption = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { redemptionId } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.id;

    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
    });

    if (!redemption) {
      throw new AppError('Redemption not found', 404, 'NOT_FOUND');
    }

    // Return coins to user
    await prisma.$transaction([
      prisma.redemption.update({
        where: { id: redemptionId },
        data: {
          status: 'rejected',
          rejectionReason: reason,
        },
      }),
      prisma.user.update({
        where: { id: redemption.userId },
        data: {
          charityCoinsBalance: { increment: redemption.coinsSpent },
        },
      }),
      prisma.marketplaceListing.update({
        where: { id: redemption.listingId },
        data: {
          availableQuantity: { increment: 1 },
        },
      }),
    ]);

    logger.info(`Admin ${adminId} rejected redemption ${redemptionId}. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'Redemption rejected. Coins returned to user.',
    });
  } catch (error) {
    next(error);
  }
};
