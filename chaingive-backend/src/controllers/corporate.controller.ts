import { Request, Response } from 'express';
import { CorporateService } from '../services/corporate.service';
import { inject } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';

@controller('/api/corporate')
export class CorporateController {
  constructor(
    @inject('CorporateService') private corporateService: CorporateService
  ) {}

  @httpPost('/register')
  async registerCorporate(req: Request, res: Response): Promise<void> {
    try {
      const corporate = await this.corporateService.createCorporate(req.body);
      res.status(201).json({
        success: true,
        data: corporate
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpGet('/:corporateId')
  async getCorporate(req: Request, res: Response): Promise<void> {
    try {
      const corporate = await this.corporateService.getCorporateById(req.params.corporateId);
      if (!corporate) {
        return res.status(404).json({
          success: false,
          error: 'Corporate account not found'
        });
      }

      res.json({
        success: true,
        data: corporate
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpPost('/bulk-donation')
  async createBulkDonation(req: Request, res: Response): Promise<void> {
    try {
      const bulkDonation = await this.corporateService.createBulkDonation(req.body);
      res.status(201).json({
        success: true,
        data: bulkDonation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpPost('/bulk-donation/:bulkDonationId/process')
  async processBulkDonation(req: Request, res: Response): Promise<void> {
    try {
      const { bulkDonationId } = req.params;
      const result = await this.corporateService.processBulkDonation(bulkDonationId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpGet('/:corporateId/donations')
  async getCorporateDonations(req: Request, res: Response): Promise<void> {
    try {
      const { corporateId } = req.params;
      const { startDate, endDate } = req.query;

      const donations = await this.corporateService.getCorporateDonations(
        corporateId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: donations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpGet('/:corporateId/analytics')
  async getCorporateAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { corporateId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate and endDate are required'
        });
      }

      const analytics = await this.corporateService.getCorporateAnalytics(
        corporateId,
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

  @httpPost('/:corporateId/team')
  async addTeamMember(req: Request, res: Response): Promise<void> {
    try {
      const { corporateId } = req.params;
      const { userId, role } = req.body;

      await this.corporateService.addTeamMember(corporateId, userId, role);

      res.status(201).json({
        success: true,
        message: 'Team member added successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpDelete('/:corporateId/team/:userId')
  async removeTeamMember(req: Request, res: Response): Promise<void> {
    try {
      const { corporateId, userId } = req.params;

      await this.corporateService.removeTeamMember(corporateId, userId);

      res.json({
        success: true,
        message: 'Team member removed successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpGet('/:corporateId/team')
  async getTeamMembers(req: Request, res: Response): Promise<void> {
    try {
      const { corporateId } = req.params;
      const teamMembers = await this.corporateService.getTeamMembers(corporateId);

      res.json({
        success: true,
        data: teamMembers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  @httpPut('/:corporateId/status')
  async updateCorporateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { corporateId } = req.params;
      const { status } = req.body;

      await this.corporateService.updateCorporateStatus(corporateId, status);

      res.json({
        success: true,
        message: 'Corporate status updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}