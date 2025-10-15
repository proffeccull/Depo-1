import prisma from '../utils/prisma';
import logger from '../utils/logger';

export interface CreateCorporateInput {
  companyName: string;
  companySize: string;
  industry: string;
  description?: string;
  contactPerson: string;
  contactInfo: any;
  csrBudget?: number;
}

export interface BulkOperationRequest {
  corporateId: string;
  operationType: 'bulk_donation' | 'bulk_redemption' | 'bulk_invitation';
  data: any;
  description?: string;
}

export interface CSRTrackingData {
  corporateId: string;
  totalDonated: number;
  totalBeneficiaries: number;
  projectsSupported: number;
  socialImpact: any;
}

export class CorporateService {
  async createCorporateAccount(userId: string, input: CreateCorporateInput): Promise<any> {
    try {
      // Check if user already has a corporate account
      const existingAccount = await prisma.corporateAccount.findUnique({
        where: { userId }
      });

      if (existingAccount) {
        throw new CorporateError('ACCOUNT_EXISTS', 'User already has a corporate account');
      }

      const corporateAccount = await prisma.corporateAccount.create({
        data: {
          userId,
          companyName: input.companyName,
          companySize: input.companySize,
          industry: input.industry,
          description: input.description,
          contactPerson: input.contactPerson,
          contactInfo: input.contactInfo,
          csrBudget: input.csrBudget
        }
      });

      logger.info('Corporate account created', { userId, corporateId: corporateAccount.id });
      return corporateAccount;
    } catch (error) {
      if (error instanceof CorporateError) throw error;
      logger.error('Failed to create corporate account', { error, userId, input });
      throw new CorporateError('ACCOUNT_CREATION_FAILED', 'Failed to create corporate account');
    }
  }

  async updateCorporateAccount(corporateId: string, updates: Partial<CreateCorporateInput>): Promise<any> {
    try {
      const corporateAccount = await prisma.corporateAccount.update({
        where: { id: corporateId },
        data: updates
      });

      logger.info('Corporate account updated', { corporateId });
      return corporateAccount;
    } catch (error) {
      logger.error('Failed to update corporate account', { error, corporateId });
      throw new CorporateError('ACCOUNT_UPDATE_FAILED', 'Failed to update corporate account');
    }
  }

  async getCorporateById(corporateId: string): Promise<any> {
    try {
      const corporate = await prisma.corporateAccount.findUnique({
        where: { id: corporateId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true
            }
          }
        }
      });

      if (!corporate) {
        throw new CorporateError('CORPORATE_NOT_FOUND', 'Corporate account not found');
      }

      return corporate;
    } catch (error) {
      if (error instanceof CorporateError) throw error;
      logger.error('Failed to get corporate account', { error, corporateId });
      throw new CorporateError('CORPORATE_FETCH_FAILED', 'Failed to fetch corporate account');
    }
  }

  async executeBulkOperation(request: BulkOperationRequest): Promise<any> {
    try {
      // Verify corporate account exists and is active
      const corporate = await this.getCorporateById(request.corporateId);

      if (!corporate.isActive) {
        throw new CorporateError('ACCOUNT_INACTIVE', 'Corporate account is not active');
      }

      let result: any = {};

      switch (request.operationType) {
        case 'bulk_donation':
          result = await this.executeBulkDonation(request.corporateId, request.data);
          break;
        case 'bulk_redemption':
          result = await this.executeBulkRedemption(request.corporateId, request.data);
          break;
        case 'bulk_invitation':
          result = await this.executeBulkInvitation(request.corporateId, request.data);
          break;
        default:
          throw new CorporateError('INVALID_OPERATION', 'Invalid bulk operation type');
      }

      // Log the bulk operation
      await this.logBulkOperation(request, result);

      logger.info('Bulk operation executed', {
        corporateId: request.corporateId,
        operationType: request.operationType,
        resultCount: result.processedCount
      });

      return result;
    } catch (error) {
      if (error instanceof CorporateError) throw error;
      logger.error('Failed to execute bulk operation', { error, request });
      throw new CorporateError('BULK_OPERATION_FAILED', 'Failed to execute bulk operation');
    }
  }

  async getCSRTrackingData(corporateId: string, startDate: Date, endDate: Date): Promise<CSRTrackingData> {
    try {
      // Get all donations made by corporate employees
      const [totalDonated, totalBeneficiaries, projectsSupported] = await Promise.all([
        this.getTotalCorporateDonations(corporateId, startDate, endDate),
        this.getTotalCorporateBeneficiaries(corporateId, startDate, endDate),
        this.getCorporateProjectsSupported(corporateId, startDate, endDate)
      ]);

      const socialImpact = await this.calculateSocialImpact(corporateId, startDate, endDate);

      return {
        corporateId,
        totalDonated,
        totalBeneficiaries,
        projectsSupported,
        socialImpact
      };
    } catch (error) {
      logger.error('Failed to get CSR tracking data', { error, corporateId });
      throw new CorporateError('CSR_TRACKING_FAILED', 'Failed to get CSR tracking data');
    }
  }

  async getCorporateAnalytics(corporateId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const [employeeStats, donationStats, engagementStats] = await Promise.all([
        this.getEmployeeEngagementStats(corporateId, startDate, endDate),
        this.getCorporateDonationStats(corporateId, startDate, endDate),
        this.getCorporateEngagementStats(corporateId, startDate, endDate)
      ]);

      return {
        employeeStats,
        donationStats,
        engagementStats,
        period: { startDate, endDate }
      };
    } catch (error) {
      logger.error('Failed to get corporate analytics', { error, corporateId });
      throw new CorporateError('ANALYTICS_FAILED', 'Failed to get corporate analytics');
    }
  }

  async inviteEmployees(corporateId: string, employeeEmails: string[]): Promise<any> {
    try {
      const corporate = await this.getCorporateById(corporateId);

      const invitations = employeeEmails.map(email => ({
        corporateId,
        email,
        status: 'pending',
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }));

      // In a real implementation, you'd store these invitations and send emails
      // For now, we'll just return the invitation data
      const result = {
        corporateId,
        invitationsSent: employeeEmails.length,
        invitations: invitations,
        message: 'Employee invitations prepared (email sending not implemented yet)'
      };

      logger.info('Employee invitations prepared', { corporateId, count: employeeEmails.length });
      return result;
    } catch (error) {
      if (error instanceof CorporateError) throw error;
      logger.error('Failed to invite employees', { error, corporateId });
      throw new CorporateError('INVITATION_FAILED', 'Failed to invite employees');
    }
  }

  async verifyCorporate(corporateId: string, verifiedBy: string): Promise<void> {
    try {
      await prisma.corporateAccount.update({
        where: { id: corporateId },
        data: {
          isVerified: true,
          updatedAt: new Date()
        }
      });

      // Log verification action
      await prisma.adminAction.create({
        data: {
          adminId: verifiedBy,
          action: 'verify_corporate',
          targetId: corporateId,
          details: 'Corporate account verified'
        }
      });

      logger.info('Corporate account verified', { corporateId, verifiedBy });
    } catch (error) {
      logger.error('Failed to verify corporate account', { error, corporateId });
      throw new CorporateError('VERIFICATION_FAILED', 'Failed to verify corporate account');
    }
  }

  // Private helper methods
  private async executeBulkDonation(corporateId: string, data: any): Promise<any> {
    const { employeeIds, amountPerEmployee, totalBudget } = data;

    if (employeeIds.length * amountPerEmployee > totalBudget) {
      throw new CorporateError('INSUFFICIENT_BUDGET', 'Total donation amount exceeds budget');
    }

    const results = [];
    let processedCount = 0;
    let failedCount = 0;

    for (const employeeId of employeeIds) {
      try {
        // Create donation transaction for each employee
        await prisma.transaction.create({
          data: {
            transactionRef: `CORP_DONATION_${corporateId}_${employeeId}_${Date.now()}`,
            type: 'corporate_donation',
            fromUserId: employeeId,
            amount: amountPerEmployee,
            metadata: {
              corporateId,
              bulkOperation: true,
              source: 'corporate_bulk_donation'
            }
          }
        });

        results.push({ employeeId, status: 'success', amount: amountPerEmployee });
        processedCount++;
      } catch (error) {
        results.push({ employeeId, status: 'failed', error: error.message });
        failedCount++;
      }
    }

    return {
      operationType: 'bulk_donation',
      processedCount,
      failedCount,
      totalAmount: processedCount * amountPerEmployee,
      results
    };
  }

  private async executeBulkRedemption(corporateId: string, data: any): Promise<any> {
    const { employeeIds, itemId, quantityPerEmployee } = data;

    const results = [];
    let processedCount = 0;
    let failedCount = 0;

    for (const employeeId of employeeIds) {
      try {
        // Check if employee has enough coins
        const employee = await prisma.user.findUnique({
          where: { id: employeeId },
          select: { charityCoinsBalance: true }
        });

        const listing = await prisma.marketplaceListing.findUnique({
          where: { id: itemId },
          select: { coinPrice: true, stockQuantity: true }
        });

        if (!employee || !listing) {
          throw new Error('Employee or listing not found');
        }

        const totalCost = listing.coinPrice * quantityPerEmployee;

        if (employee.charityCoinsBalance < totalCost) {
          throw new Error('Insufficient coins');
        }

        if (listing.stockQuantity < quantityPerEmployee) {
          throw new Error('Insufficient stock');
        }

        // Create redemption
        await prisma.redemption.create({
          data: {
            userId: employeeId,
            listingId: itemId,
            coinsSpent: totalCost,
            realValue: 0, // Would calculate based on item value
            status: 'processing'
          }
        });

        results.push({ employeeId, status: 'success', quantity: quantityPerEmployee });
        processedCount++;
      } catch (error) {
        results.push({ employeeId, status: 'failed', error: error.message });
        failedCount++;
      }
    }

    return {
      operationType: 'bulk_redemption',
      processedCount,
      failedCount,
      results
    };
  }

  private async executeBulkInvitation(corporateId: string, data: any): Promise<any> {
    const { employeeEmails } = data;

    // This would integrate with email service to send invitations
    // For now, just return success
    return {
      operationType: 'bulk_invitation',
      processedCount: employeeEmails.length,
      failedCount: 0,
      results: employeeEmails.map((email: string) => ({ email, status: 'invited' }))
    };
  }

  private async logBulkOperation(request: BulkOperationRequest, result: any): Promise<void> {
    await prisma.adminAction.create({
      data: {
        adminId: request.corporateId, // Corporate admin
        action: `bulk_${request.operationType}`,
        details: {
          operationType: request.operationType,
          description: request.description,
          data: request.data,
          result: result
        }
      }
    });
  }

  private async getTotalCorporateDonations(corporateId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: {
        type: 'corporate_donation',
        createdAt: { gte: startDate, lte: endDate },
        metadata: {
          path: '$.corporateId',
          equals: corporateId
        }
      },
      _sum: { amount: true }
    });

    return result._sum.amount || 0;
  }

  private async getTotalCorporateBeneficiaries(corporateId: string, startDate: Date, endDate: Date): Promise<number> {
    // Count unique recipients of corporate donations
    const recipients = await prisma.transaction.findMany({
      where: {
        type: 'corporate_donation',
        createdAt: { gte: startDate, lte: endDate },
        metadata: {
          path: '$.corporateId',
          equals: corporateId
        }
      },
      select: { toUserId: true },
      distinct: ['toUserId']
    });

    return recipients.filter(r => r.toUserId).length;
  }

  private async getCorporateProjectsSupported(corporateId: string, startDate: Date, endDate: Date): Promise<number> {
    // Count unique cycles supported
    const cycles = await prisma.transaction.findMany({
      where: {
        type: 'corporate_donation',
        createdAt: { gte: startDate, lte: endDate },
        metadata: {
          path: '$.corporateId',
          equals: corporateId
        }
      },
      select: { cycleId: true },
      distinct: ['cycleId']
    });

    return cycles.filter(c => c.cycleId).length;
  }

  private async calculateSocialImpact(corporateId: string, startDate: Date, endDate: Date): Promise<any> {
    // Calculate various social impact metrics
    const donations = await this.getTotalCorporateDonations(corporateId, startDate, endDate);
    const beneficiaries = await this.getTotalCorporateBeneficiaries(corporateId, startDate, endDate);

    return {
      totalDonations: donations,
      beneficiariesReached: beneficiaries,
      averageDonationPerBeneficiary: beneficiaries > 0 ? donations / beneficiaries : 0,
      impactCategories: ['education', 'healthcare', 'community_development'], // Would be more sophisticated
      sustainabilityScore: Math.min(100, (donations / 10000) * 100) // Simple scoring
    };
  }

  private async getEmployeeEngagementStats(corporateId: string, startDate: Date, endDate: Date): Promise<any> {
    // Get stats about employee participation
    const employees = await this.getCorporateEmployees(corporateId);

    const activeEmployees = employees.filter(emp =>
      emp.cycles.some((cycle: any) =>
        cycle.createdAt >= startDate && cycle.createdAt <= endDate
      )
    );

    return {
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      engagementRate: employees.length > 0 ? (activeEmployees.length / employees.length) * 100 : 0
    };
  }

  private async getCorporateDonationStats(corporateId: string, startDate: Date, endDate: Date): Promise<any> {
    const donations = await prisma.transaction.findMany({
      where: {
        type: 'corporate_donation',
        createdAt: { gte: startDate, lte: endDate },
        metadata: {
          path: '$.corporateId',
          equals: corporateId
        }
      }
    });

    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const avgAmount = donations.length > 0 ? totalAmount / donations.length : 0;

    return {
      totalDonations: donations.length,
      totalAmount,
      averageAmount: avgAmount,
      donationFrequency: donations.length / this.getDaysBetween(startDate, endDate)
    };
  }

  private async getCorporateEngagementStats(corporateId: string, startDate: Date, endDate: Date): Promise<any> {
    // Calculate engagement metrics
    const employees = await this.getCorporateEmployees(corporateId);

    const totalCycles = employees.reduce((sum, emp) =>
      sum + emp.cycles.filter((cycle: any) =>
        cycle.createdAt >= startDate && cycle.createdAt <= endDate
      ).length, 0
    );

    return {
      totalCycles,
      averageCyclesPerEmployee: employees.length > 0 ? totalCycles / employees.length : 0,
      mostActiveEmployee: employees.sort((a, b) =>
        b.cycles.filter((cycle: any) =>
          cycle.createdAt >= startDate && cycle.createdAt <= endDate
        ).length - a.cycles.filter((cycle: any) =>
          cycle.createdAt >= startDate && cycle.createdAt <= endDate
        ).length
      )[0]?.id
    };
  }

  private async getCorporateEmployees(corporateId: string): Promise<any[]> {
    // In a real implementation, you'd have a corporate-employee relationship table
    // For now, return empty array
    return [];
  }

  private getDaysBetween(startDate: Date, endDate: Date): number {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export class CorporateError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'CorporateError';
  }
}