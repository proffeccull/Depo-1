import { Request, Response } from 'express';
import { MerchantService } from '../services/merchant.service';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut } from 'inversify-express-utils';

@controller('/api/merchant')
export class MerchantController {
  constructor(
    @inject('MerchantService') private merchantService: MerchantService
  ) {}

  @httpPost('/register')
  async registerMerchant(req: Request, res: Response): Promise<void> {
    try {
      const merchant = await this.merchantService.createMerchant(req.body);
      res.status(201).json({
        success: true,
        data: merchant
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpGet('/:merchantId')
  async getMerchant(req: Request, res: Response): Promise<void> {
    try {
      const merchant = await this.merchantService.getMerchantById(req.params.merchantId);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: 'Merchant not found'
        });
      }

      res.json({
        success: true,
        data: merchant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpGet('/search/location')
  async searchByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { location, limit = 20 } = req.query;
      const merchants = await this.merchantService.getMerchantsByLocation(
        location as string,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: merchants
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpGet('/search/query')
  async searchMerchants(req: Request, res: Response): Promise<void> {
    try {
      const { q: query, limit = 20 } = req.query;
      const merchants = await this.merchantService.searchMerchants(
        query as string,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: merchants
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpPost('/payment-request')
  async createPaymentRequest(req: Request, res: Response): Promise<void> {
    try {
      const paymentRequest = await this.merchantService.createPaymentRequest(req.body);
      res.status(201).json({
        success: true,
        data: paymentRequest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpGet('/:merchantId/payment-requests')
  async getMerchantPaymentRequests(req: Request, res: Response): Promise<void> {
    try {
      const { merchantId } = req.params;
      const { status } = req.query;

      const paymentRequests = await this.merchantService.getMerchantPaymentRequests(
        merchantId,
        status as string
      );

      res.json({
        success: true,
        data: paymentRequests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpPost('/payment/:paymentRequestId/process')
  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentRequestId } = req.params;
      const { userId, amount } = req.body;

      const payment = await this.merchantService.processPayment(
        paymentRequestId,
        userId,
        amount
      );

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpGet('/:merchantId/analytics')
  async getMerchantAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { merchantId } = req.params;
      const { startDate, endDate } = req.query;

      const analytics = await this.merchantService.getMerchantAnalytics(
        merchantId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpPut('/:merchantId/status')
  async updateMerchantStatus(req: Request, res: Response): Promise<void> {
    try {
      const { merchantId } = req.params;
      const { status } = req.body;

      await this.merchantService.updateMerchantStatus(merchantId, status);

      res.json({
        success: true,
        message: 'Merchant status updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}