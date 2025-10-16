import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import winston from 'winston';

export interface CreateMerchantInput {
  userId: string;
  businessName: string;
  businessType: string;
  description?: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  services: string[];
}

export interface CreatePaymentRequestInput {
  merchantId: string;
  amount: number;
  currency: string;
  description: string;
  qrCode?: string;
  expiresAt?: Date;
}

@injectable()
export class MerchantService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Logger') private logger: winston.Logger
  ) {}

  async createMerchant(data: CreateMerchantInput): Promise<any> {
    try {
      const merchant = await this.prisma.merchantAccount.create({
        data: {
          userId: data.userId,
          businessName: data.businessName,
          businessType: data.businessType,
          description: data.description,
          location: data.location,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          website: data.website,
          services: data.services,
          status: 'pending_verification'
        }
      });

      this.logger.info('Merchant account created', { merchantId: merchant.id, userId: data.userId });
      return merchant;
    } catch (error) {
      this.logger.error('Failed to create merchant account', { error, data });
      throw new Error('MERCHANT_CREATION_FAILED');
    }
  }

  async getMerchantById(merchantId: string): Promise<any> {
    try {
      return await this.prisma.merchantAccount.findUnique({
        where: { id: merchantId },
        include: {
          user: {
            select: { id: true, displayName: true, profilePicture: true }
          }
        }
      });
    } catch (error) {
      this.logger.error('Failed to get merchant', { error, merchantId });
      throw new Error('MERCHANT_FETCH_FAILED');
    }
  }

  async getMerchantsByLocation(location: string, limit: number = 20): Promise<any[]> {
    try {
      return await this.prisma.merchantAccount.findMany({
        where: {
          location: { contains: location, mode: 'insensitive' },
          status: 'verified'
        },
        include: {
          user: {
            select: { id: true, displayName: true, profilePicture: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      this.logger.error('Failed to get merchants by location', { error, location });
      throw new Error('MERCHANTS_FETCH_FAILED');
    }
  }

  async searchMerchants(query: string, limit: number = 20): Promise<any[]> {
    try {
      return await this.prisma.merchantAccount.findMany({
        where: {
          AND: [
            { status: 'verified' },
            {
              OR: [
                { businessName: { contains: query, mode: 'insensitive' } },
                { businessType: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { services: { hasSome: [query] } }
              ]
            }
          ]
        },
        include: {
          user: {
            select: { id: true, displayName: true, profilePicture: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      this.logger.error('Failed to search merchants', { error, query });
      throw new Error('MERCHANT_SEARCH_FAILED');
    }
  }

  async createPaymentRequest(data: CreatePaymentRequestInput): Promise<any> {
    try {
      const paymentRequest = await this.prisma.merchantPaymentRequest.create({
        data: {
          merchantId: data.merchantId,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          qrCode: data.qrCode,
          expiresAt: data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          status: 'active'
        }
      });

      this.logger.info('Merchant payment request created', {
        requestId: paymentRequest.id,
        merchantId: data.merchantId,
        amount: data.amount
      });

      return paymentRequest;
    } catch (error) {
      this.logger.error('Failed to create payment request', { error, data });
      throw new Error('PAYMENT_REQUEST_CREATION_FAILED');
    }
  }

  async getMerchantPaymentRequests(merchantId: string, status?: string): Promise<any[]> {
    try {
      const where: any = { merchantId };

      if (status) {
        where.status = status;
      }

      return await this.prisma.merchantPaymentRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          merchant: {
            select: { businessName: true, businessType: true }
          }
        }
      });
    } catch (error) {
      this.logger.error('Failed to get merchant payment requests', { error, merchantId });
      throw new Error('PAYMENT_REQUESTS_FETCH_FAILED');
    }
  }

  async processPayment(paymentRequestId: string, userId: string, amount: number): Promise<any> {
    try {
      const paymentRequest = await this.prisma.merchantPaymentRequest.findUnique({
        where: { id: paymentRequestId },
        include: { merchant: true }
      });

      if (!paymentRequest) {
        throw new Error('PAYMENT_REQUEST_NOT_FOUND');
      }

      if (paymentRequest.status !== 'active') {
        throw new Error('PAYMENT_REQUEST_INACTIVE');
      }

      if (paymentRequest.expiresAt && paymentRequest.expiresAt < new Date()) {
        throw new Error('PAYMENT_REQUEST_EXPIRED');
      }

      if (paymentRequest.amount !== amount) {
        throw new Error('AMOUNT_MISMATCH');
      }

      // Create payment record
      const payment = await this.prisma.merchantPayment.create({
        data: {
          paymentRequestId,
          userId,
          amount,
          currency: paymentRequest.currency,
          status: 'completed'
        }
      });

      // Update payment request status
      await this.prisma.merchantPaymentRequest.update({
        where: { id: paymentRequestId },
        data: { status: 'completed' }
      });

      this.logger.info('Merchant payment processed', {
        paymentId: payment.id,
        paymentRequestId,
        userId,
        amount
      });

      return payment;
    } catch (error) {
      this.logger.error('Failed to process merchant payment', { error, paymentRequestId, userId });
      throw error;
    }
  }

  async getMerchantAnalytics(merchantId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const [totalPayments, totalRevenue, paymentRequests, recentPayments] = await Promise.all([
        this.prisma.merchantPayment.count({
          where: {
            paymentRequest: { merchantId },
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        this.prisma.merchantPayment.aggregate({
          where: {
            paymentRequest: { merchantId },
            createdAt: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        this.prisma.merchantPaymentRequest.count({
          where: { merchantId, createdAt: { gte: startDate, lte: endDate } }
        }),
        this.prisma.merchantPayment.findMany({
          where: {
            paymentRequest: { merchantId },
            createdAt: { gte: startDate, lte: endDate }
          },
          include: {
            user: { select: { displayName: true } },
            paymentRequest: { select: { description: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      return {
        totalPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalRequests: paymentRequests,
        conversionRate: paymentRequests > 0 ? (totalPayments / paymentRequests) * 100 : 0,
        recentPayments
      };
    } catch (error) {
      this.logger.error('Failed to get merchant analytics', { error, merchantId });
      throw new Error('MERCHANT_ANALYTICS_FAILED');
    }
  }

  async updateMerchantStatus(merchantId: string, status: 'pending_verification' | 'verified' | 'rejected' | 'suspended'): Promise<void> {
    try {
      await this.prisma.merchantAccount.update({
        where: { id: merchantId },
        data: { status }
      });

      this.logger.info('Merchant status updated', { merchantId, status });
    } catch (error) {
      this.logger.error('Failed to update merchant status', { error, merchantId, status });
      throw new Error('MERCHANT_STATUS_UPDATE_FAILED');
    }
  }
}