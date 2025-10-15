import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import winston from 'winston';
import axios from 'axios';
import crypto from 'crypto';

export interface CryptoPaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  gateway: 'btcpay' | 'coinbase' | 'cryptomus' | 'binance' | 'paypal';
  purpose: 'coin_purchase' | 'donation';
  metadata?: any;
}

export interface PaymentResult {
  transactionId: string;
  paymentUrl?: string;
  qrCode?: string;
  address?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
}

@injectable()
export class CryptoGatewayService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Logger') private logger: winston.Logger
  ) {}

  async createPayment(request: CryptoPaymentRequest): Promise<PaymentResult> {
    try {
      const gateway = await this.getGateway(request.gateway);
      if (!gateway || !gateway.isActive) {
        throw new Error('GATEWAY_NOT_AVAILABLE');
      }

      let paymentResult: PaymentResult;

      switch (request.gateway) {
        case 'btcpay':
          paymentResult = await this.createBTCPayInvoice(request, gateway);
          break;
        case 'coinbase':
          paymentResult = await this.createCoinbaseCharge(request, gateway);
          break;
        case 'cryptomus':
          paymentResult = await this.createCryptomusPayment(request, gateway);
          break;
        case 'binance':
          paymentResult = await this.createBinancePayment(request, gateway);
          break;
        case 'paypal':
          paymentResult = await this.createPayPalCryptoPayment(request, gateway);
          break;
        default:
          throw new Error('UNSUPPORTED_GATEWAY');
      }

      // Store transaction record
      await this.prisma.cryptoTransaction.create({
        data: {
          userId: request.userId,
          gatewayId: gateway.id,
          externalId: paymentResult.transactionId,
          transactionType: request.purpose,
          amount: request.amount,
          currency: request.currency,
          status: paymentResult.status,
          usdEquivalent: await this.convertToUSD(request.amount, request.currency)
        }
      });

      // Send Africa's Talking notification for payment creation
      await this.sendPaymentNotification(request.userId, request.gateway, paymentResult);

      this.logger.info('Crypto payment created', {
        userId: request.userId,
        gateway: request.gateway,
        amount: request.amount,
        currency: request.currency
      });

      return paymentResult;
    } catch (error) {
      this.logger.error('Failed to create crypto payment', { error, request });
      throw error;
    }
  }

  private async createBTCPayInvoice(request: CryptoPaymentRequest, gateway: any): Promise<PaymentResult> {
    const config = gateway.configuration;
    
    const invoiceData = {
      amount: request.amount,
      currency: request.currency,
      orderId: `chaingive-${Date.now()}`,
      notificationUrl: `${process.env.API_BASE_URL}/webhooks/btcpay`,
      redirectUrl: `${process.env.FRONTEND_URL}/payment/success`,
      metadata: {
        userId: request.userId,
        purpose: request.purpose,
        ...request.metadata
      }
    };

    const response = await axios.post(
      `${config.apiUrl}/api/v1/stores/${config.storeId}/invoices`,
      invoiceData,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      transactionId: response.data.id,
      paymentUrl: response.data.checkoutLink,
      amount: request.amount,
      currency: request.currency,
      status: 'pending'
    };
  }

  private async createCoinbaseCharge(request: CryptoPaymentRequest, gateway: any): Promise<PaymentResult> {
    const config = gateway.configuration;
    
    const chargeData = {
      name: `ChainGive ${request.purpose}`,
      description: `${request.purpose} for user ${request.userId}`,
      pricing_type: 'fixed_price',
      local_price: {
        amount: request.amount.toString(),
        currency: request.currency
      },
      metadata: {
        userId: request.userId,
        purpose: request.purpose
      },
      redirect_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
    };

    const response = await axios.post(
      'https://api.commerce.coinbase.com/charges',
      chargeData,
      {
        headers: {
          'X-CC-Api-Key': config.apiKey,
          'X-CC-Version': '2018-03-22',
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      transactionId: response.data.data.id,
      paymentUrl: response.data.data.hosted_url,
      amount: request.amount,
      currency: request.currency,
      status: 'pending'
    };
  }

  private async createCryptomusPayment(request: CryptoPaymentRequest, gateway: any): Promise<PaymentResult> {
    const config = gateway.configuration;
    
    const paymentData = {
      amount: request.amount.toString(),
      currency: request.currency,
      order_id: `chaingive-${Date.now()}`,
      url_return: `${process.env.FRONTEND_URL}/payment/success`,
      url_callback: `${process.env.API_BASE_URL}/webhooks/cryptomus`,
      is_payment_multiple: false,
      lifetime: 7200, // 2 hours
      additional_data: JSON.stringify({
        userId: request.userId,
        purpose: request.purpose
      })
    };

    // Generate signature for Cryptomus
    const sign = this.generateCryptomusSignature(paymentData, config.apiKey);

    const response = await axios.post(
      'https://api.cryptomus.com/v1/payment',
      paymentData,
      {
        headers: {
          'merchant': config.merchantId,
          'sign': sign,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      transactionId: response.data.result.uuid,
      paymentUrl: response.data.result.url,
      amount: request.amount,
      currency: request.currency,
      status: 'pending'
    };
  }

  private async createBinancePayment(request: CryptoPaymentRequest, gateway: any): Promise<PaymentResult> {
    const config = gateway.configuration;

    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(32).toString('hex');

    const payload = {
      merchantId: config.merchantId,
      merchantTradeNo: `chaingive-${Date.now()}`,
      totalFee: request.amount,
      currency: request.currency,
      productName: `ChainGive ${request.purpose}`,
      productDetail: `ChainGive ${request.purpose} for user ${request.userId}`,
      returnUrl: `${process.env.FRONTEND_URL}/payment/success`
    };

    // Create signature
    const payloadString = JSON.stringify(payload);
    const signature = crypto.createHmac('sha512', config.secretKey)
      .update(timestamp + '\n' + nonce + '\n' + payloadString + '\n')
      .digest('hex');

    const response = await axios.post(
      'https://bpay.binanceapi.com/binancepay/openapi/v2/order',
      payload,
      {
        headers: {
          'BinancePay-Timestamp': timestamp,
          'BinancePay-Nonce': nonce,
          'BinancePay-Certificate-SN': config.apiKey,
          'BinancePay-Signature': signature,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      transactionId: response.data.data.prepayId,
      paymentUrl: response.data.data.checkoutUrl,
      qrCode: response.data.data.qrcodeLink,
      amount: request.amount,
      currency: request.currency,
      status: 'pending'
    };
  }

  private async createPayPalCryptoPayment(request: CryptoPaymentRequest, gateway: any): Promise<PaymentResult> {
    const config = gateway.configuration;

    // Get PayPal access token
    const tokenResponse = await axios.post(
      'https://api.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        auth: {
          username: config.clientId,
          password: config.clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Create PayPal order
    const orderResponse = await axios.post(
      'https://api.paypal.com/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: request.currency,
            value: request.amount.toString()
          },
          description: `ChainGive ${request.purpose}`
        }],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              brand_name: 'ChainGive',
              locale: 'en-NG',
              landing_page: 'LOGIN',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              return_url: `${process.env.FRONTEND_URL}/payment/success`,
              cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
            }
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      transactionId: orderResponse.data.id,
      paymentUrl: orderResponse.data.links.find((link: any) => link.rel === 'approve').href,
      amount: request.amount,
      currency: request.currency,
      status: 'pending'
    };
  }

  async processWebhook(gateway: string, payload: any, signature?: string): Promise<void> {
    try {
      const gatewayConfig = await this.getGateway(gateway as any);
      if (!gatewayConfig) {
        throw new Error('GATEWAY_NOT_FOUND');
      }

      // Verify webhook signature
      if (signature && !this.verifyWebhookSignature(gateway, payload, signature, gatewayConfig)) {
        throw new Error('INVALID_WEBHOOK_SIGNATURE');
      }

      let transactionId: string;
      let status: 'pending' | 'confirmed' | 'failed';

      switch (gateway) {
        case 'btcpay':
          transactionId = payload.invoiceId;
          status = this.mapBTCPayStatus(payload.type);
          break;
        case 'coinbase':
          transactionId = payload.data.id;
          status = this.mapCoinbaseStatus(payload.event.type);
          break;
        case 'cryptomus':
          transactionId = payload.uuid;
          status = this.mapCryptomusStatus(payload.status);
          break;
        default:
          throw new Error('UNSUPPORTED_WEBHOOK_GATEWAY');
      }

      // Update transaction status
      await this.updateTransactionStatus(transactionId, status, payload);

      this.logger.info('Webhook processed successfully', { gateway, transactionId, status });
    } catch (error) {
      this.logger.error('Failed to process webhook', { error, gateway, payload });
      throw error;
    }
  }

  private async getGateway(provider: string): Promise<any> {
    return await this.prisma.cryptoGateway.findUnique({
      where: { provider }
    });
  }

  private async updateTransactionStatus(externalId: string, status: string, webhookData: any): Promise<void> {
    await this.prisma.cryptoTransaction.updateMany({
      where: { externalId },
      data: {
        status: status as any,
        webhookData,
        updatedAt: new Date()
      }
    });

    // If confirmed, process the payment (add coins, complete donation, etc.)
    if (status === 'confirmed') {
      await this.processConfirmedPayment(externalId);
    }
  }

  private async processConfirmedPayment(externalId: string): Promise<void> {
    const transaction = await this.prisma.cryptoTransaction.findFirst({
      where: { externalId }
    });

    if (!transaction) return;

    if (transaction.transactionType === 'coin_purchase') {
      // Add coins to user account
      const coinAmount = Math.floor(transaction.usdEquivalent || 0); // 1 USD = 1 coin
      await this.prisma.user.update({
        where: { id: transaction.userId },
        data: { charityCoins: { increment: coinAmount } }
      });

      this.logger.info('Coins added to user account', {
        userId: transaction.userId,
        amount: coinAmount
      });
    }
  }

  private generateCryptomusSignature(data: any, apiKey: string): string {
    const jsonString = JSON.stringify(data);
    const hash = crypto.createHash('md5').update(Buffer.from(jsonString).toString('base64') + apiKey).digest('hex');
    return hash;
  }

  private verifyWebhookSignature(gateway: string, payload: any, signature: string, gatewayConfig: any): boolean {
    switch (gateway) {
      case 'btcpay':
        const expectedSig = crypto.createHmac('sha256', gatewayConfig.configuration.webhookSecret)
          .update(JSON.stringify(payload))
          .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
      default:
        return true; // Skip verification for other gateways for now
    }
  }

  private mapBTCPayStatus(eventType: string): 'pending' | 'confirmed' | 'failed' {
    switch (eventType) {
      case 'InvoiceSettled':
      case 'InvoiceProcessing':
        return 'confirmed';
      case 'InvoiceExpired':
      case 'InvoiceInvalid':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private mapCoinbaseStatus(eventType: string): 'pending' | 'confirmed' | 'failed' {
    switch (eventType) {
      case 'charge:confirmed':
        return 'confirmed';
      case 'charge:failed':
      case 'charge:expired':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private mapCryptomusStatus(status: string): 'pending' | 'confirmed' | 'failed' {
    switch (status) {
      case 'paid':
      case 'paid_over':
        return 'confirmed';
      case 'fail':
      case 'cancel':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private async convertToUSD(amount: number, currency: string): Promise<number> {
    if (currency === 'USD') return amount;

    // In a real implementation, you'd call a currency conversion API
    // For now, return a mock conversion
    const conversionRates: Record<string, number> = {
      'BTC': 45000,
      'ETH': 3000,
      'USDT': 1,
      'USDC': 1
    };

    return amount * (conversionRates[currency] || 1);
  }

  /**
   * Send Africa's Talking notification for payment events
   */
  private async sendPaymentNotification(userId: string, gateway: string, paymentResult: PaymentResult): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true }
      });

      if (!user?.phoneNumber) return;

      // Import SMS service dynamically to avoid circular dependencies
      const { sendSMS } = await import('./sms.service');

      let message = '';
      switch (gateway) {
        case 'btcpay':
          message = `ChainGive: Your ₦${paymentResult.amount} BTCPay invoice is ready. Pay here: ${paymentResult.paymentUrl}`;
          break;
        case 'coinbase':
          message = `ChainGive: Your ₦${paymentResult.amount} Coinbase payment is ready. Pay here: ${paymentResult.paymentUrl}`;
          break;
        case 'cryptomus':
          message = `ChainGive: Your ₦${paymentResult.amount} Cryptomus payment is ready. Pay here: ${paymentResult.paymentUrl}`;
          break;
        case 'binance':
          message = `ChainGive: Your ₦${paymentResult.amount} Binance payment is ready. Pay here: ${paymentResult.paymentUrl}`;
          break;
        case 'paypal':
          message = `ChainGive: Your ₦${paymentResult.amount} PayPal payment is ready. Pay here: ${paymentResult.paymentUrl}`;
          break;
      }

      if (message) {
        await sendSMS(user.phoneNumber, message);
      }
    } catch (error) {
      this.logger.error('Failed to send payment notification', { error, userId, gateway });
      // Don't throw - notification failure shouldn't break payment flow
    }
  }
}