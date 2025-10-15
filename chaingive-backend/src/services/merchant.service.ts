import prisma from '../utils/prisma';
import logger from '../utils/logger';

export interface CreateMerchantInput {
  businessName: string;
  businessType: string;
  description?: string;
  location?: any;
  contactInfo: any;
}

export interface MerchantPaymentRequest {
  merchantId: string;
  amount: number;
  description?: string;
  customerPhone?: string;
}

export interface MerchantPaymentResponse {
  paymentId: string;
  paymentUrl: string;
  qrCode?: string;
  expiresAt: Date;
}

export class MerchantService {
  async createMerchantAccount(userId: string, input: CreateMerchantInput): Promise<any> {
    try {
      // Check if user already has a merchant account
      const existingAccount = await prisma.merchantAccount.findUnique({
        where: { userId }
      });

      if (existingAccount) {
        throw new MerchantError('ACCOUNT_EXISTS', 'User already has a merchant account');
      }

      const merchantAccount = await prisma.merchantAccount.create({
        data: {
          userId,
          businessName: input.businessName,
          businessType: input.businessType,
          description: input.description,
          location: input.location,
          contactInfo: input.contactInfo,
          qrCodeUrl: await this.generateMerchantQR(userId)
        }
      });

      logger.info('Merchant account created', { userId, merchantId: merchantAccount.id });
      return merchantAccount;
    } catch (error) {
      if (error instanceof MerchantError) throw error;
      logger.error('Failed to create merchant account', { error, userId, input });
      throw new MerchantError('ACCOUNT_CREATION_FAILED', 'Failed to create merchant account');
    }
  }

  async updateMerchantAccount(merchantId: string, updates: Partial<CreateMerchantInput>): Promise<any> {
    try {
      const merchantAccount = await prisma.merchantAccount.update({
        where: { id: merchantId },
        data: {
          ...updates,
          qrCodeUrl: updates.businessName ? await this.generateMerchantQR(merchantId) : undefined
        }
      });

      logger.info('Merchant account updated', { merchantId });
      return merchantAccount;
    } catch (error) {
      logger.error('Failed to update merchant account', { error, merchantId });
      throw new MerchantError('ACCOUNT_UPDATE_FAILED', 'Failed to update merchant account');
    }
  }

  async getMerchantById(merchantId: string): Promise<any> {
    try {
      const merchant = await prisma.merchantAccount.findUnique({
        where: { id: merchantId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true
            }
          }
        }
      });

      if (!merchant) {
        throw new MerchantError('MERCHANT_NOT_FOUND', 'Merchant account not found');
      }

      return merchant;
    } catch (error) {
      if (error instanceof MerchantError) throw error;
      logger.error('Failed to get merchant', { error, merchantId });
      throw new MerchantError('MERCHANT_FETCH_FAILED', 'Failed to fetch merchant');
    }
  }

  async searchMerchants(query: string, location?: any, businessType?: string): Promise<any[]> {
    try {
      const merchants = await prisma.merchantAccount.findMany({
        where: {
          isActive: true,
          isVerified: true,
          ...(query && {
            OR: [
              { businessName: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { businessType: { contains: query, mode: 'insensitive' } }
            ]
          }),
          ...(businessType && { businessType }),
          ...(location && {
            location: {
              // GeoJSON distance query would go here
              // For now, we'll use country matching
              path: '$.country',
              equals: location.country
            }
          })
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        take: 50
      });

      return merchants;
    } catch (error) {
      logger.error('Failed to search merchants', { error, query, location, businessType });
      throw new MerchantError('SEARCH_FAILED', 'Failed to search merchants');
    }
  }

  async createPaymentRequest(request: MerchantPaymentRequest): Promise<MerchantPaymentResponse> {
    try {
      const merchant = await this.getMerchantById(request.merchantId);

      // Create payment request record
      const paymentRequest = await prisma.transaction.create({
        data: {
          transactionRef: `MERCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'merchant_payment',
          amount: request.amount,
          description: request.description,
          metadata: {
            merchantId: request.merchantId,
            customerPhone: request.customerPhone,
            paymentType: 'merchant'
          }
        }
      });

      // Generate payment URL (could integrate with payment gateway)
      const paymentUrl = `${process.env.FRONTEND_URL}/merchant/pay/${paymentRequest.id}`;

      // Generate QR code for payment
      const qrCode = await this.generatePaymentQR(paymentRequest.id, request.amount);

      logger.info('Merchant payment request created', {
        merchantId: request.merchantId,
        paymentId: paymentRequest.id,
        amount: request.amount
      });

      return {
        paymentId: paymentRequest.id,
        paymentUrl,
        qrCode,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      };
    } catch (error) {
      if (error instanceof MerchantError) throw error;
      logger.error('Failed to create payment request', { error, request });
      throw new MerchantError('PAYMENT_REQUEST_FAILED', 'Failed to create payment request');
    }
  }

  async processPayment(paymentId: string, paymentMethod: string, paymentData: any): Promise<boolean> {
    try {
      const payment = await prisma.transaction.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        throw new MerchantError('PAYMENT_NOT_FOUND', 'Payment request not found');
      }

      if (payment.status !== 'pending') {
        throw new MerchantError('PAYMENT_ALREADY_PROCESSED', 'Payment already processed');
      }

      // Process payment based on method
      let paymentSuccessful = false;

      switch (paymentMethod) {
        case 'mobile_money':
          paymentSuccessful = await this.processMobileMoneyPayment(payment, paymentData);
          break;
        case 'bank_transfer':
          paymentSuccessful = await this.processBankTransferPayment(payment, paymentData);
          break;
        case 'crypto':
          paymentSuccessful = await this.processCryptoPayment(payment, paymentData);
          break;
        default:
          throw new MerchantError('UNSUPPORTED_PAYMENT_METHOD', 'Unsupported payment method');
      }

      if (paymentSuccessful) {
        await prisma.transaction.update({
          where: { id: paymentId },
          data: {
            status: 'completed',
            paymentMethod,
            paymentProviderRef: paymentData.reference,
            completedAt: new Date()
          }
        });

        // Notify merchant
        await this.notifyMerchantOfPayment(paymentId);

        logger.info('Merchant payment processed successfully', { paymentId, paymentMethod });
      }

      return paymentSuccessful;
    } catch (error) {
      if (error instanceof MerchantError) throw error;
      logger.error('Failed to process payment', { error, paymentId, paymentMethod });
      throw new MerchantError('PAYMENT_PROCESSING_FAILED', 'Failed to process payment');
    }
  }

  async getMerchantTransactions(merchantId: string, page: number = 1, limit: number = 20): Promise<any> {
    try {
      const offset = (page - 1) * limit;

      const transactions = await prisma.transaction.findMany({
        where: {
          type: 'merchant_payment',
          metadata: {
            path: '$.merchantId',
            equals: merchantId
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      });

      const total = await prisma.transaction.count({
        where: {
          type: 'merchant_payment',
          metadata: {
            path: '$.merchantId',
            equals: merchantId
          }
        }
      });

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get merchant transactions', { error, merchantId });
      throw new MerchantError('TRANSACTIONS_FETCH_FAILED', 'Failed to fetch transactions');
    }
  }

  async getMerchantAnalytics(merchantId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const [totalRevenue, transactionCount, avgTransaction, topPaymentMethods] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            type: 'merchant_payment',
            status: 'completed',
            createdAt: { gte: startDate, lte: endDate },
            metadata: {
              path: '$.merchantId',
              equals: merchantId
            }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.count({
          where: {
            type: 'merchant_payment',
            status: 'completed',
            createdAt: { gte: startDate, lte: endDate },
            metadata: {
              path: '$.merchantId',
              equals: merchantId
            }
          }
        }),
        prisma.transaction.aggregate({
          where: {
            type: 'merchant_payment',
            status: 'completed',
            createdAt: { gte: startDate, lte: endDate },
            metadata: {
              path: '$.merchantId',
              equals: merchantId
            }
          },
          _avg: { amount: true }
        }),
        prisma.transaction.groupBy({
          by: ['paymentMethod'],
          where: {
            type: 'merchant_payment',
            status: 'completed',
            createdAt: { gte: startDate, lte: endDate },
            metadata: {
              path: '$.merchantId',
              equals: merchantId
            }
          },
          _count: { paymentMethod: true }
        })
      ]);

      return {
        totalRevenue: totalRevenue._sum.amount || 0,
        transactionCount,
        avgTransactionValue: avgTransaction._avg.amount || 0,
        topPaymentMethods: topPaymentMethods.map(method => ({
          method: method.paymentMethod,
          count: method._count.paymentMethod
        }))
      };
    } catch (error) {
      logger.error('Failed to get merchant analytics', { error, merchantId });
      throw new MerchantError('ANALYTICS_FAILED', 'Failed to fetch analytics');
    }
  }

  async verifyMerchant(merchantId: string, verifiedBy: string): Promise<void> {
    try {
      await prisma.merchantAccount.update({
        where: { id: merchantId },
        data: {
          isVerified: true,
          updatedAt: new Date()
        }
      });

      // Log verification action
      await prisma.adminAction.create({
        data: {
          adminId: verifiedBy,
          action: 'verify_merchant',
          targetId: merchantId,
          details: 'Merchant account verified'
        }
      });

      logger.info('Merchant verified', { merchantId, verifiedBy });
    } catch (error) {
      logger.error('Failed to verify merchant', { error, merchantId });
      throw new MerchantError('VERIFICATION_FAILED', 'Failed to verify merchant');
    }
  }

  // Private helper methods
  private async generateMerchantQR(userId: string): Promise<string> {
    // Generate QR code containing merchant info
    const qrData = JSON.stringify({
      type: 'merchant',
      userId,
      timestamp: Date.now()
    });

    // In a real implementation, use a QR code library
    // For now, return a placeholder URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  }

  private async generatePaymentQR(paymentId: string, amount: number): Promise<string> {
    const qrData = JSON.stringify({
      type: 'merchant_payment',
      paymentId,
      amount,
      timestamp: Date.now()
    });

    // Return QR code URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  }

  private async processMobileMoneyPayment(payment: any, paymentData: any): Promise<boolean> {
    // Integrate with mobile money provider (e.g., Africa's Talking, Flutterwave)
    // For now, simulate successful payment
    return Math.random() > 0.1; // 90% success rate
  }

  private async processBankTransferPayment(payment: any, paymentData: any): Promise<boolean> {
    // Verify bank transfer details
    // For now, simulate verification
    return Math.random() > 0.05; // 95% success rate
  }

  private async processCryptoPayment(payment: any, paymentData: any): Promise<boolean> {
    // Verify crypto transaction
    // For now, simulate verification
    return Math.random() > 0.1; // 90% success rate
  }

  private async notifyMerchantOfPayment(paymentId: string): Promise<void> {
    try {
      const payment = await prisma.transaction.findUnique({
        where: { id: paymentId },
        include: {
          // Get merchant info from metadata
        }
      });

      if (payment?.metadata?.merchantId) {
        // Send notification to merchant
        await sendSMS(
          await this.getMerchantPhone(payment.metadata.merchantId),
          `Payment received: ₦${payment.amount} - ${payment.metadata?.description || 'Merchant payment'}`
        );
      }
    } catch (error) {
      logger.error('Failed to notify merchant of payment', { error, paymentId });
    }
  }

  private async getMerchantPhone(merchantId: string): Promise<string> {
    const merchant = await prisma.merchantAccount.findUnique({
      where: { id: merchantId },
      include: { user: { select: { phoneNumber: true } } }
    });
    return merchant?.user?.phoneNumber || '';
  }
}

export class MerchantError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'MerchantError';
  }
}

// Helper function (should be imported from SMS service)
async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  // Implementation would use Africa's Talking or similar
  console.log(`SMS to ${phoneNumber}: ${message}`);
}