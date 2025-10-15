import { Request, Response } from 'express';
import { CryptoGatewayService } from '../services/cryptoGateway.service';
import logger from '../utils/logger';
import crypto from 'crypto';
import axios from 'axios';

export class WebhooksController {
  constructor(private cryptoGatewayService: CryptoGatewayService) {}

  /**
   * BTCPay webhook handler
   */
  async handleBTCPayWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['btcpay-sig'] as string;
      const rawBody = JSON.stringify(req.body);

      // Verify webhook signature
      const gateway = await this.getGatewayByName('btcpay');
      if (!gateway) {
        logger.warn('BTCPay gateway not found');
        res.status(404).json({ error: 'Gateway not configured' });
        return;
      }

      const expectedSignature = this.generateBTCPaySignature(rawBody, gateway.configuration.webhookSecret);
      if (!this.verifySignature(signature, expectedSignature)) {
        logger.warn('Invalid BTCPay webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      // Process webhook
      await this.cryptoGatewayService.processWebhook('btcpay', req.body, signature);

      res.status(200).json({ status: 'processed' });
    } catch (error) {
      logger.error('BTCPay webhook processing failed', { error });
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  /**
   * Coinbase webhook handler
   */
  async handleCoinbaseWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-cc-webhook-signature'] as string;

      // Verify webhook signature
      const gateway = await this.getGatewayByName('coinbase');
      if (!gateway) {
        logger.warn('Coinbase gateway not found');
        res.status(404).json({ error: 'Gateway not configured' });
        return;
      }

      const expectedSignature = this.generateCoinbaseSignature(JSON.stringify(req.body), gateway.configuration.webhookSecret);
      if (!this.verifySignature(signature, expectedSignature)) {
        logger.warn('Invalid Coinbase webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      // Process webhook
      await this.cryptoGatewayService.processWebhook('coinbase', req.body, signature);

      res.status(200).json({ status: 'processed' });
    } catch (error) {
      logger.error('Coinbase webhook processing failed', { error });
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  /**
   * Cryptomus webhook handler
   */
  async handleCryptomusWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['sign'] as string;

      // Verify webhook signature
      const gateway = await this.getGatewayByName('cryptomus');
      if (!gateway) {
        logger.warn('Cryptomus gateway not found');
        res.status(404).json({ error: 'Gateway not configured' });
        return;
      }

      const expectedSignature = this.generateCryptomusSignature(JSON.stringify(req.body), gateway.configuration.apiKey);
      if (!this.verifySignature(signature, expectedSignature)) {
        logger.warn('Invalid Cryptomus webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      // Process webhook
      await this.cryptoGatewayService.processWebhook('cryptomus', req.body, signature);

      res.status(200).json({ status: 'processed' });
    } catch (error) {
      logger.error('Cryptomus webhook processing failed', { error });
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  /**
   * Binance Pay webhook handler
   */
  async handleBinanceWebhook(req: Request, res: Response): Promise<void> {
    try {
      const timestamp = req.headers['binancepay-timestamp'] as string;
      const nonce = req.headers['binancepay-nonce'] as string;
      const signature = req.headers['binancepay-signature'] as string;

      // Verify webhook signature
      const gateway = await this.getGatewayByName('binance');
      if (!gateway) {
        logger.warn('Binance gateway not found');
        res.status(404).json({ error: 'Gateway not configured' });
        return;
      }

      const payload = JSON.stringify(req.body);
      const expectedSignature = this.generateBinanceSignature(payload, gateway.configuration.secretKey, timestamp, nonce);
      if (!this.verifySignature(signature, expectedSignature)) {
        logger.warn('Invalid Binance webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      // Process webhook
      await this.cryptoGatewayService.processWebhook('binance', req.body, signature);

      res.status(200).json({ status: 'processed' });
    } catch (error) {
      logger.error('Binance webhook processing failed', { error });
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  /**
   * PayPal webhook handler
   */
  async handlePayPalWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['paypal-transmission-signature'] as string;
      const transmissionId = req.headers['paypal-transmission-id'] as string;
      const timestamp = req.headers['paypal-transmission-time'] as string;

      // Verify webhook signature
      const gateway = await this.getGatewayByName('paypal');
      if (!gateway) {
        logger.warn('PayPal gateway not found');
        res.status(404).json({ error: 'Gateway not configured' });
        return;
      }

      // PayPal webhook verification is more complex - requires API call
      const isValid = await this.verifyPayPalWebhook(req.body, signature, transmissionId, timestamp, gateway);
      if (!isValid) {
        logger.warn('Invalid PayPal webhook signature');
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      // Process webhook
      await this.cryptoGatewayService.processWebhook('paypal', req.body, signature);

      res.status(200).json({ status: 'processed' });
    } catch (error) {
      logger.error('PayPal webhook processing failed', { error });
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  /**
   * Helper methods for signature verification
   */
  private generateBTCPaySignature(payload: string, secret: string): string {
    return require('crypto').createHmac('sha256', secret).update(payload).digest('hex');
  }

  private generateCoinbaseSignature(payload: string, secret: string): string {
    return require('crypto').createHmac('sha256', secret).update(payload).digest('hex');
  }

  private generateCryptomusSignature(payload: string, apiKey: string): string {
    const jsonString = JSON.stringify(JSON.parse(payload));
    return require('crypto').createHash('md5').update(Buffer.from(jsonString).toString('base64') + apiKey).digest('hex');
  }

  private generateBinanceSignature(payload: string, secretKey: string, timestamp: string, nonce: string): string {
    const message = `${timestamp}\n${nonce}\n${payload}\n`;
    return require('crypto').createHmac('sha512', secretKey).update(message).digest('hex');
  }

  private async verifyPayPalWebhook(payload: any, signature: string, transmissionId: string, timestamp: string, gateway: any): Promise<boolean> {
    try {
      // Get PayPal access token
      const tokenResponse = await require('axios').post(
        'https://api.paypal.com/v1/oauth2/token',
        'grant_type=client_credentials',
        {
          auth: {
            username: gateway.configuration.clientId,
            password: gateway.configuration.clientSecret
          },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      // Verify webhook
      const verifyResponse = await require('axios').post(
        'https://api.paypal.com/v1/notifications/verify-webhook-signature',
        {
          transmission_id: transmissionId,
          transmission_time: timestamp,
          cert_url: payload.cert_url,
          auth_algo: payload.auth_algo,
          transmission_sig: signature,
          webhook_event: payload
        },
        {
          headers: {
            'Authorization': `Bearer ${tokenResponse.data.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return verifyResponse.data.verification_status === 'SUCCESS';
    } catch (error) {
      logger.error('PayPal webhook verification failed', { error });
      return false;
    }
  }

  private verifySignature(received: string, expected: string): boolean {
    try {
      return require('crypto').timingSafeEqual(
        Buffer.from(received),
        Buffer.from(expected)
      );
    } catch {
      return false;
    }
  }

  private async getGatewayByName(name: string): Promise<any> {
    // This would need to be injected or accessed through a service
    // For now, return a mock gateway config
    const mockConfigs: Record<string, any> = {
      btcpay: {
        configuration: {
          webhookSecret: process.env.BTCPAY_WEBHOOK_SECRET
        }
      },
      coinbase: {
        configuration: {
          webhookSecret: process.env.COINBASE_WEBHOOK_SECRET
        }
      },
      cryptomus: {
        configuration: {
          apiKey: process.env.CRYPTOMUS_API_KEY
        }
      },
      binance: {
        configuration: {
          secretKey: process.env.BINANCE_SECRET_KEY
        }
      },
      paypal: {
        configuration: {
          clientId: process.env.PAYPAL_CLIENT_ID,
          clientSecret: process.env.PAYPAL_CLIENT_SECRET
        }
      }
    };

    return mockConfigs[name] || null;
  }
}