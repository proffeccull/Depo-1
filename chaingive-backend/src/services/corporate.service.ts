import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import winston from 'winston';

export interface CreateCorporateInput {
  userId: string;
  companyName: string;
  companyType: string;
  industry: string;
  description?: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  employeeCount?: number;
  annualRevenue?: number;
}

export interface BulkDonationInput {
  corporateId: string;
  amount: number;
  currency: string;
  recipientCount: number;
  distributionType: 'equal' | 'weighted';
  description?: string;
}

@injectable()
export class CorporateService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Logger') private logger: winston.Logger
  ) {}

  async createCorporate(data: CreateCorporateInput): Promise<any> {
    try {
      const corporate = await this.prisma.corporateAccount.create({
        data: {
          userId: data.userId,
          companyName: data.companyName,
          companyType: data.companyType,
          industry: data.industry,
          description: data.description,
          location: data.location,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          website: data.website,
          employeeCount: data.employeeCount,
          annualRevenue: data.annualRevenue,
          status: 'pending_verification'
        }
      });

      this.logger.info('Corporate account created', { corporateId: corporate.id, userId: data.userId });
      return corporate;
    } catch (error) {
      this.logger.error('Failed to create corporate account', { error, data });
      throw new Error('CORPORATE_CREATION_FAILED');
    }
  }

  async getCorporateById(corporateId: string): Promise<any> {
    try {
      return await this.prisma.corporateAccount.findUnique({
        where: { id: corporateId },
        include: {
          user: {
            select: { id: true, displayName: true, profilePicture: true }
          }
        }
      });
    } catch (error) {
      this.logger.error('Failed to get corporate', { error, corporateId });
      throw new Error('CORPORATE_FETCH_FAILED');
    }
  }

  async createBulkDonation(data: BulkDonationInput): Promise<any> {
    try {
      const bulkDonation = await this.prisma.corporateBulkDonation.create({
        data: {
          corporateId: data.corporateId,
          amount: data.amount,
          currency: data.currency,
          recipientCount: data.recipientCount,
          distributionType: data.distributionType,
          description: data.description,
          status: 'pending'
        }
      });

      this.logger.info('Corporate bulk donation created', {
        donationId: bulkDonation.id,
        corporateId: data.corporateId,
        amount: data.amount,
        recipientCount: data.recipientCount
      });

      return bulkDonation;
    } catch (error) {
      this.logger.error('Failed to create bulk donation', { error, data });
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

      if (bulkDonation.status !== 'pending') {
        throw new Error('BULK_DONATION_ALREADY_PROCESSED');
      }

      // Get available recipients based on criteria
      const recipients = await this.getEligibleRecipients(bulkDonation.recipientCount);

      if (recipients.length < bulkDonation.recipientCount) {
        throw new Error('INSUFFICIENT_ELIGIBLE_RECIPIENTS');
      }

      // Calculate distribution amounts
      const distribution = this.calculateDistribution(
        bulkDonation.amount,
        bulkDonation.recipientCount,
        bulkDonation.distributionType
      );

      // Create individual donations
      const donations = [];
      for (let i = 0; i < recipients.length && i < bulkDonation.recipientCount; i++) {
        const donation = await this.prisma.donation.create({
          data: {
            donorId: bulkDonation.corporate.userId,
            recipientId: recipients[i].id,
            amount: distribution[i],
            currency: bulkDonation.currency,
            status: 'matched',
            bulkDonationId: bulkDonation.id
          }
        });
        donations.push(donation);
      }

      // Update bulk donation status
      await this.prisma.corporateBulkDonation.update({
        where: { id: bulkDonationId },
        data: {
          status: 'processed',
          processedAt: new Date(),
          actualRecipientCount: donations.length
        }
      });

      this.logger.info('Bulk donation processed', {
        bulkDonationId,
        recipientCount: donations.length,
        totalAmount: bulkDonation.amount
      });

      return {
        bulkDonation: { ...bulkDonation, status: 'processed' },
        donations
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

      return await this.prisma.corporateBulkDonation.findMany({
        where,
        include: {
          corporate: {
            select: { companyName: true, companyType: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      this.logger.error('Failed to get corporate donations', { error, corporateId });
      throw new Error('CORPORATE_DONATIONS_FETCH_FAILED');
    }
  }

  async getCorporateAnalytics(corporateId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const [totalDonations, totalAmount, donationCount, impactMetrics] = await Promise.all([
        this.prisma.corporateBulkDonation.aggregate({
          where: {
            corporateId,
            createdAt: { gte: startDate, lte: endDate },
            status: 'processed'
          },
          _sum: { amount: true }
        }),
        this.prisma.corporateBulkDonation.count({
          where: {
            corporateId,
            createdAt: { gte: startDate, lte: endDate },
            status: 'processed'
          }
        }),
        this.prisma.donation.count({
          where: {
            bulkDonation: { corporateId },
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        this.calculateImpactMetrics(corporateId, startDate, endDate)
      ]);

      return {
        totalAmount: totalDonations._sum.amount || 0,
        donationCount: totalAmount,
        individualRecipients: donationCount,
        impactMetrics
      };
    } catch (error) {
      this.logger.error('Failed to get corporate analytics', { error, corporateId });
      throw new Error('CORPORATE_ANALYTICS_FAILED');
    }
  }

  async addTeamMember(corporateId: string, userId: string, role: 'admin' | 'manager' | 'member'): Promise<void> {
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
      return await this.prisma.corporateTeamMember.findMany({
        where: { corporateId },
        include: {
          user: {
            select: { id: true, displayName: true, email: true, profilePicture: true }
          }
        },
        orderBy: { joinedAt: 'desc' }
      });
    } catch (error) {
      this.logger.error('Failed to get team members', { error, corporateId });
      throw new Error('TEAM_MEMBERS_FETCH_FAILED');
    }
  }

  async updateCorporateStatus(corporateId: string, status: 'pending_verification' | 'verified' | 'rejected' | 'suspended'): Promise<void> {
    try {
      await this.prisma.corporateAccount.update({
        where: { id: corporateId },
        data: { status }
      });

      this.logger.info('Corporate status updated', { corporateId, status });
    } catch (error) {
      this.logger.error('Failed to update corporate status', { error, corporateId, status });
      throw new Error('CORPORATE_STATUS_UPDATE_FAILED');
    }
  }

  private async getEligibleRecipients(count: number): Promise<any[]> {
    // Get recipients who are actively receiving and have good trust scores
    return await this.prisma.user.findMany({
      where: {
        isReceiving: true,
        trustScore: { gte: 3.0 },
        isBanned: false
      },
      orderBy: [
        { trustScore: 'desc' },
        { lastActivityAt: 'desc' }
      ],
      take: count * 2 // Get more than needed for better selection
    });
  }

  private calculateDistribution(totalAmount: number, recipientCount: number, type: 'equal' | 'weighted'): number[] {
    if (type === 'equal') {
      const baseAmount = Math.floor(totalAmount / recipientCount);
      const remainder = totalAmount % recipientCount;
      const distribution = new Array(recipientCount).fill(baseAmount);

      // Distribute remainder to first recipients
      for (let i = 0; i < remainder; i++) {
        distribution[i]++;
      }

      return distribution;
    } else {
      // Weighted distribution - could be based on need, location, etc.
      // For now, use equal distribution as fallback
      return this.calculateDistribution(totalAmount, recipientCount, 'equal');
    }
  }

  private async calculateImpactMetrics(corporateId: string, startDate: Date, endDate: Date): Promise<any> {
    // Calculate social impact metrics for corporate donations
    const donations = await this.prisma.donation.findMany({
      where: {
        bulkDonation: { corporateId },
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        recipient: {
          select: { location: true, trustScore: true }
        }
      }
    });

    const locations = donations.map(d => d.recipient.location).filter(Boolean);
    const uniqueLocations = new Set(locations).size;
    const avgTrustScore = donations.reduce((sum, d) => sum + d.recipient.trustScore, 0) / donations.length;

    return {
      communitiesReached: uniqueLocations,
      averageRecipientTrust: avgTrustScore,
      totalRecipients: donations.length
    };
  }
}