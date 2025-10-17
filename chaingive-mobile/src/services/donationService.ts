import { apiClient, handleApiError } from './api';
import { donationsAPI } from '../api/donations';

export interface GiveDonationData {
  amount: number;
  recipientPreference: 'algorithm' | 'manual';
  recipientId?: string;
  location?: string;
  faith?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  recipientId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'DEFAULTED';
  dueDate: string;
  confirmedAt?: string;
  createdAt: string;
  donor?: {
    id: string;
    firstName: string;
    lastName: string;
    trustScore: number;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    trustScore: number;
  };
}

export interface Match {
  id: string;
  recipientId: string;
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    trustScore: number;
    location?: string;
    faithPreference?: string;
  };
  amount: number;
  matchScore: number;
  expiresAt: string;
}

/**
 * Donation Service
 * Handles all donation-related API calls
 */
class DonationService {
  /**
   * Give a donation
   */
  async giveDonation(data: GiveDonationData): Promise<{
    donation: Donation;
    match: Match;
    message: string;
  }> {
    try {
      const response = await donationsAPI.give(data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Confirm receipt of donation
   */
  async confirmReceipt(donationId: string, confirm: boolean): Promise<{
    success: boolean;
    donation: Donation;
    charityCoinsEarned: number;
    message: string;
  }> {
    try {
      const response = await donationsAPI.confirmReceipt({ transactionId: donationId, confirm });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const donationService = new DonationService();
export default donationService;
