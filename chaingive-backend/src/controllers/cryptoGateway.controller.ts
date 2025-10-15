import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { CryptoGatewayService } from '../services/cryptoGateway.service';
import { body, param, query, validationResult } from 'express-validator';

@injectable()
export class CryptoGatewayController {
  constructor(
    @inject('CryptoGatewayService') private cryptoGatewayService: CryptoGatewayService
  ) {}

  // Create crypto payment
  createPayment = [
    body('amount').isFloat({ min: 0.01 }),
    body('currency').isString().isLength({ min: 3, max: 10 }),
    body('gateway').isIn(['btcpay', 'coinbase', 'cryptomus', 'binance', 'paypal']),
    body('purpose').isIn(['coin_purchase', 'donation']),
    body('metadata').optional().isObject(),

    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const paymentRequest = {
          userId: req.user.id,
          amount: req.body.amount,
          currency: req.body.currency,
          gateway: req.body.gateway,
          purpose: req.body.purpose,
          metadata: req.body.metadata
        };

        const paymentResult = await this.cryptoGatewayService.createPayment(paymentRequest);

        res.status(201).json({
          message: 'Payment created successfully',
          payment: paymentResult
        });
      } catch (error) {
        if (error.message === 'GATEWAY_NOT_AVAILABLE') {
          return res.status(400).json({ error: 'Selected payment gateway is not available' });
        }
        if (error.message === 'UNSUPPORTED_GATEWAY') {
          return res.status(400).json({ error: 'Unsupported payment gateway' });
        }
        res.status(500).json({ error: 'Failed to create payment' });
      }
    }
  ];

  // Get available gateways
  getGateways = async (req: Request, res: Response) => {
    try {
      // This would fetch from the database in a real implementation
      const gateways = [
        {
          id: 'btcpay',
          name: 'BTCPay Server',
          supportedCurrencies: ['BTC', 'LTC', 'ETH'],
          fees: '0.5%',
          processingTime: '10-60 minutes',
          isActive: true
        },
        {
          id: 'coinbase',
          name: 'Coinbase Commerce',
          supportedCurrencies: ['BTC', 'ETH', 'LTC', 'BCH', 'USDC'],
          fees: '1%',
          processingTime: '5-30 minutes',
          isActive: true
        },
        {
          id: 'cryptomus',
          name: 'Cryptomus',
          supportedCurrencies: ['BTC', 'ETH', 'USDT', 'USDC', 'TRX'],
          fees: '0.8%',
          processingTime: '5-20 minutes',
          isActive: true
        },
        {
          id: 'binance',
          name: 'Binance Pay',
          supportedCurrencies: ['BTC', 'ETH', 'BNB', 'USDT', 'BUSD'],
          fees: '0.3%',
          processingTime: '1-10 minutes',
          isActive: false // Not implemented yet
        },
        {
          id: 'paypal',
          name: 'PayPal Crypto',
          supportedCurrencies: ['BTC', 'ETH', 'LTC', 'BCH'],
          fees: '2.3%',
          processingTime: '1-5 minutes',
          isActive: false // Not implemented yet
        }
      ];

      res.json({
        gateways: gateways.filter(g => g.isActive),
        total: gateways.filter(g => g.isActive).length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch gateways' });
    }
  };

  // Get transaction history
  getTransactions = [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('status').optional().isIn(['pending', 'confirmed', 'failed', 'cancelled']),
    query('type').optional().isIn(['coin_purchase', 'donation', 'withdrawal']),

    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        // This would be implemented in the service
        // For now, return mock data
        const transactions = [
          {
            id: 'tx-1',
            amount: 50,
            currency: 'USDT',
            type: 'coin_purchase',
            status: 'confirmed',
            gateway: 'cryptomus',
            createdAt: new Date().toISOString(),
            confirmations: 12
          }
        ];

        res.json({
          transactions,
          pagination: {
            limit: parseInt(req.query.limit as string) || 20,
            offset: parseInt(req.query.offset as string) || 0,
            total: transactions.length
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
      }
    }
  ];

  // Get transaction details
  getTransaction = [
    param('transactionId').isUUID(),

    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        // This would be implemented in the service
        // For now, return mock data
        const transaction = {
          id: req.params.transactionId,
          amount: 50,
          currency: 'USDT',
          type: 'coin_purchase',
          status: 'confirmed',
          gateway: 'cryptomus',
          blockchainHash: '0x1234567890abcdef',
          confirmations: 12,
          createdAt: new Date().toISOString(),
          confirmedAt: new Date().toISOString()
        };

        res.json({ transaction });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transaction details' });
      }
    }
  ];

  // Get supported currencies
  getSupportedCurrencies = async (req: Request, res: Response) => {
    try {
      const currencies = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          network: 'Bitcoin',
          minAmount: 0.0001,
          maxAmount: 10,
          confirmations: 3,
          estimatedTime: '30-60 minutes'
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          network: 'Ethereum',
          minAmount: 0.001,
          maxAmount: 100,
          confirmations: 12,
          estimatedTime: '5-15 minutes'
        },
        {
          symbol: 'USDT',
          name: 'Tether',
          network: 'Ethereum',
          minAmount: 1,
          maxAmount: 10000,
          confirmations: 12,
          estimatedTime: '5-15 minutes'
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          network: 'Ethereum',
          minAmount: 1,
          maxAmount: 10000,
          confirmations: 12,
          estimatedTime: '5-15 minutes'
        }
      ];

      res.json({
        currencies,
        total: currencies.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch supported currencies' });
    }
  };

  // Estimate transaction fee
  estimateFee = [
    query('amount').isFloat({ min: 0.01 }),
    query('currency').isString(),
    query('gateway').isIn(['btcpay', 'coinbase', 'cryptomus', 'binance', 'paypal']),

    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const amount = parseFloat(req.query.amount as string);
        const currency = req.query.currency as string;
        const gateway = req.query.gateway as string;

        // Simple fee calculation (in production, this would be more sophisticated)
        const feeRates: Record<string, number> = {
          btcpay: 0.005,    // 0.5%
          coinbase: 0.01,   // 1%
          cryptomus: 0.008, // 0.8%
          binance: 0.003,   // 0.3%
          paypal: 0.023     // 2.3%
        };

        const feeRate = feeRates[gateway] || 0.01;
        const fee = amount * feeRate;
        const total = amount + fee;

        res.json({
          estimate: {
            amount,
            currency,
            gateway,
            fee,
            feeRate: feeRate * 100, // Convert to percentage
            total,
            estimatedTime: '5-30 minutes'
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to estimate fee' });
      }
    }
  ];
}