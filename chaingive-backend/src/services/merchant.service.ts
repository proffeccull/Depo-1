import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import winston from 'winston';

export interface CreateMerchantInput {
  businessName: string;
  businessType: 'retail' | 'service' | 'food' | 'other';
  description?: string;
  location?: any;
  contactInfo: any;
  userId: string;
}

export interface CreatePaymentRequestInput {
  merchantId: string;
  amount: number;
  currency: string;
  description?: string;
  userId: string;
}

@injectable()
export class MerchantService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Logger') private logger: winston.Logger
  ) {}

  async createMerchant(input: CreateMerchantInput): Promise<any> {
    try {
      const merchant = await this.prisma.merchant.create({
        data: {
          businessName: input.businessName,
          businessType: input.businessType,
          description: input.description,
          location: input.location,
          contactInfo: input.contactInfo,
          userId: input.userId,
          isVerified: false,
          status: 'pending'
        }
      });

      this.logger.info('Merchant created', { merchantId: merchant.id, userId: input.userId });
      return merchant;
    } catch (error) {
      this.logger.error('Failed to create merchant', { error, input });
      throw new Error('MERCHANT_CREATION_FAILED');
    }
  }

  async getMerchantById(merchantId: string): Promise<any> {
    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
        include: {
          user: {
            select: { id: true, displayName: true, email: true }
          }
        }
      });

      return merchant;
    } catch (error) {
      this.logger.error('Failed to get merchant', { error, merchantId });
      throw new Error('MERCHANT_FETCH_FAILED');
    }
  }

  async getMerchantsByLocation(location: string, limit: number = 20): Promise<any[]> {
    try {
      // This would use geospatial queries in production
      const merchants = await this.prisma.merchant.findMany({
        where: {
          location: { contains: location },
          isVerified: true,
          status: 'active'
        },
        take: limit,
        include: {
          user: {
            select: { displayName: true }
          }
        }
      });

      return merchants;
    } catch (error) {
      this.logger.error('Failed to get merchants by location', { error, location });
      throw new Error('MERCHANTS_LOCATION_FAILED');
    }
  }

  async searchMerchants(query: string, limit: number = 20): Promise<any[]> {
    try {
      const merchants = await this.prisma.merchant.findMany({
        where: {
          AND: [
            { isVerified: true },
            { status: 'active' },
            {
              OR: [
                { businessName: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { businessType: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        take: limit,
        include: {
          user: {
            select: { displayName: true }
          }
        }
      });

      return merchants;
    } catch (error) {
      this.logger.error('Failed to search merchants', { error, query });
      throw new Error('MERCHANT_SEARCH_FAILED');
    }
  }

  async createPaymentRequest(input: CreatePaymentRequestInput): Promise<any> {
    try {
      const paymentRequest = await this.prisma.merchantPaymentRequest.create({
        data: {
          merchantId: input.merchantId,
          amount: input.amount,
          currency: input.currency,
          description: input.description,
          userId: input.userId,
          status: 'pending',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      this.logger.info('Payment request created', {
        paymentRequestId: paymentRequest.id,
        merchantId: input.merchantId,
        amount: input.amount
      });

      return paymentRequest;
    } catch (error) {
      this.logger.error('Failed to create payment request', { error, input });
      throw new Error('PAYMENT_REQUEST_CREATION_FAILED');
    }
  }

  async getMerchantPaymentRequests(merchantId: string, status?: string): Promise<any[]> {
    try {
      const where: any = { merchantId };

      if (status) {
        where.status = status;
      }

      const paymentRequests = await this.prisma.merchantPaymentRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, displayName: true, email: true }
          }
        }
      });

      return paymentRequests;
    } catch (error) {
      this.logger.error('Failed to get merchant payment requests', { error, merchantId });
      throw new Error('PAYMENT_REQUESTS_FETCH_FAILED');
    }
  }

  async processPayment(paymentRequestId: string, userId: string, amount: number): Promise<any> {
    try {
      // This would integrate with payment gateways in production
      const payment = await this.prisma.merchantPayment.create({
        data: {
          paymentRequestId,
          userId,
          amount,
          status: 'completed',
          processedAt: new Date()
        }
      });

      // Update payment request status
      await this.prisma.merchantPaymentRequest.update({
        where: { id: paymentRequestId },
        data: { status: 'completed' }
      });

      this.logger.info('Payment processed', {
        paymentId: payment.id,
        paymentRequestId,
        amount
      });

      return payment;
    } catch (error) {
      this.logger.error('Failed to process payment', { error, paymentRequestId });
      throw new Error('PAYMENT_PROCESSING_FAILED');
    }
  }

  async getMerchantAnalytics(merchantId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const [totalPayments, totalRevenue, paymentRequests] = await Promise.all([
        this.prisma.merchantPayment.count({
          where: {
            paymentRequest: { merchantId },
            processedAt: { gte: startDate, lte: endDate }
          }
        }),
        this.prisma.merchantPayment.aggregate({
          where: {
            paymentRequest: { merchantId },
            processedAt: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        this.prisma.merchantPaymentRequest.count({
          where: {
            merchantId,
            createdAt: { gte: startDate, lte: endDate }
          }
        })
      ]);

      return {
        period: { startDate, endDate },
        totalPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalRequests: paymentRequests,
        conversionRate: paymentRequests > 0 ? totalPayments / paymentRequests : 0
      };
    } catch (error) {
      this.logger.error('Failed to get merchant analytics', { error, merchantId });
      throw new Error('MERCHANT_ANALYTICS_FAILED');
    }
  }

  async updateMerchantStatus(merchantId: string, status: string): Promise<void> {
    try {
      await this.prisma.merchant.update({
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
