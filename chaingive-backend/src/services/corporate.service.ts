import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import winston from 'winston';

export interface CreateCorporateInput {
  companyName: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  contactPerson: string;
  contactInfo: any;
  csrBudget?: number;
  userId: string;
}

export interface CreateBulkDonationInput {
  corporateId: string;
  donations: Array<{
    amount: number;
    currency: string;
    recipientCount: number;
    description?: string;
  }>;
}

@injectable()
export class CorporateService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Logger') private logger: winston.Logger
  ) {}

  async createCorporate(input: CreateCorporateInput): Promise<any> {
    try {
      const corporate = await this.prisma.corporate.create({
        data: {
          companyName: input.companyName,
          companySize: input.companySize,
          industry: input.industry,
          contactPerson: input.contactPerson,
          contactInfo: input.contactInfo,
          csrBudget: input.csrBudget,
          userId: input.userId,
          isVerified: false,
          status: 'pending'
        }
      });

      this.logger.info('Corporate account created', { corporateId: corporate.id, userId: input.userId });
      return corporate;
    } catch (error) {
      this.logger.error('Failed to create corporate account', { error, input });
      throw new Error('CORPORATE_CREATION_FAILED');
    }
  }

  async getCorporateById(corporateId: string): Promise<any> {
    try {
      const corporate = await this.prisma.corporate.findUnique({
        where: { id: corporateId },
        include: {
          user: {
            select: { id: true, displayName: true, email: true }
          }
        }
      });

      return corporate;
    } catch (error) {
      this.logger.error('Failed to get corporate account', { error, corporateId });
      throw new Error('CORPORATE_FETCH_FAILED');
    }
  }

  async createBulkDonation(input: CreateBulkDonationInput): Promise<any> {
    try {
      const bulkDonation = await this.prisma.corporateBulkDonation.create({
        data: {
          corporateId: input.corporateId,
          totalAmount: input.donations.reduce((sum, d) => sum + d.amount, 0),
          totalRecipients: input.donations.reduce((sum, d) => sum + d.recipientCount, 0),
          donations: input.donations,
          status: 'pending'
        }
      });

      this.logger.info('Bulk donation created', {
        bulkDonationId: bulkDonation.id,
        corporateId: input.corporateId,
        totalAmount: bulkDonation.totalAmount
      });

      return bulkDonation;
    } catch (error) {
      this.logger.error('Failed to create bulk donation', { error, input });
      throw new Error('BULK_DONATION_CREATION_FAILED');
    }
  }

  async processBulkDonation(bulkDonationId: string): Promise<any> {
    try {
      const bulkDonation = await this.prisma.corporateBulkDonation.findUnique({
        where: { id: bulkDonationId },
        include: { corporate: true }
      });

      if (!bulkDonation) {
        throw new Error('BULK_DONATION_NOT_FOUND');
      }

      // Create individual donations for each donation in the bulk
      const individualDonations = [];

      for (const donation of bulkDonation.donations) {
        // This would match recipients and create individual donations
        // For now, create placeholder donations
        for (let i = 0; i < donation.recipientCount; i++) {
          const individualDonation = await this.prisma.donation.create({
            data: {
              amount: donation.amount / donation.recipientCount,
              currency: donation.currency,
              status: 'pending',
              corporateId: bulkDonation.corporateId,
              description: donation.description
            }
          });
          individualDonations.push(individualDonation);
        }
      }

      // Update bulk donation status
      await this.prisma.corporateBulkDonation.update({
        where: { id: bulkDonationId },
        data: { status: 'processed' }
      });

      this.logger.info('Bulk donation processed', {
        bulkDonationId,
        individualDonationsCount: individualDonations.length
      });

      return {
        bulkDonationId,
        processedDonations: individualDonations.length,
        totalAmount: bulkDonation.totalAmount
      };
    } catch (error) {
      this.logger.error('Failed to process bulk donation', { error, bulkDonationId });
      throw error;
    }
  }

  async getCorporateDonations(corporateId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      const where: any = { corporateId };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const donations = await this.prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          recipient: {
            select: { id: true, displayName: true, location: true }
          }
        }
      });

      return donations;
    } catch (error) {
      this.logger.error('Failed to get corporate donations', { error, corporateId });
      throw new Error('CORPORATE_DONATIONS_FETCH_FAILED');
    }
  }

  async getCorporateAnalytics(corporateId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const [totalDonations, totalAmount, successfulDonations, bulkDonations] = await Promise.all([
        this.prisma.donation.count({
          where: {
            corporateId,
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        this.prisma.donation.aggregate({
          where: {
            corporateId,
            createdAt: { gte: startDate, lte: endDate }
          },
          _sum: { amount: true }
        }),
        this.prisma.donation.count({
          where: {
            corporateId,
            status: 'fulfilled',
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        this.prisma.corporateBulkDonation.count({
          where: {
            corporateId,
            createdAt: { gte: startDate, lte: endDate }
          }
        })
      ]);

      return {
        period: { startDate, endDate },
        totalDonations,
        totalAmount: totalAmount._sum.amount || 0,
        successfulDonations,
        successRate: totalDonations > 0 ? successfulDonations / totalDonations : 0,
        bulkDonations,
        averageDonation: totalDonations > 0 ? (totalAmount._sum.amount || 0) / totalDonations : 0
      };
    } catch (error) {
      this.logger.error('Failed to get corporate analytics', { error, corporateId });
      throw new Error('CORPORATE_ANALYTICS_FAILED');
    }
  }

  async addTeamMember(corporateId: string, userId: string, role: string): Promise<void> {
    try {
      await this.prisma.corporateTeamMember.create({
        data: {
          corporateId,
          userId,
          role
        }
      });

      this.logger.info('Team member added to corporate', { corporateId, userId, role });
    } catch (error) {
      this.logger.error('Failed to add team member', { error, corporateId, userId });
      throw new Error('TEAM_MEMBER_ADD_FAILED');
    }
  }

  async removeTeamMember(corporateId: string, userId: string): Promise<void> {
    try {
      await this.prisma.corporateTeamMember.delete({
        where: {
          corporateId_userId: {
            corporateId,
            userId
          }
        }
      });

      this.logger.info('Team member removed from corporate', { corporateId, userId });
    } catch (error) {
      this.logger.error('Failed to remove team member', { error, corporateId, userId });
      throw new Error('TEAM_MEMBER_REMOVE_FAILED');
    }
  }

  async getTeamMembers(corporateId: string): Promise<any[]> {
    try {
      const teamMembers = await this.prisma.corporateTeamMember.findMany({
        where: { corporateId },
        include: {
          user: {
            select: { id: true, displayName: true, email: true, profilePicture: true }
          }
        },
        orderBy: { joinedAt: 'asc' }
      });

      return teamMembers.map(tm => ({
        ...tm.user,
        role: tm.role,
        joinedAt: tm.joinedAt
      }));
    } catch (error) {
      this.logger.error('Failed to get team members', { error, corporateId });
      throw new Error('TEAM_MEMBERS_FETCH_FAILED');
    }
  }

  async updateCorporateStatus(corporateId: string, status: string): Promise<void> {
    try {
      await this.prisma.corporate.update({
        where: { id: corporateId },
        data: { status }
      });

      this.logger.info('Corporate status updated', { corporateId, status });
    } catch (error) {
      this.logger.error('Failed to update corporate status', { error, corporateId, status });
      throw new Error('CORPORATE_STATUS_UPDATE_FAILED');
    }
  }
}
