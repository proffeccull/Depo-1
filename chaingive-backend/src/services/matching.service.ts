import prisma from '../utils/prisma';
import { checkUserQualifiesForReceipt } from './forceRecycle.service';
import logger from '../utils/logger';

interface MatchPreferences {
  location?: string;
  faith?: string;
}

interface UserFeatures {
  trustScore: number;
  locationProximity: number;
  timeWaiting: number;
  completedCycles: number;
  donationHistory: number;
  categoryPreference: number;
  age: number;
  accountAge: number;
}

interface MatchingModel {
  weights: {
    locationProximity: number;
    trustScore: number;
    timeWaiting: number;
    donationHistory: number;
    categoryPreference: number;
    age: number;
    accountAge: number;
    completedCycles: number;
    randomization: number;
  };
  thresholds: {
    minTrustScore: number;
    maxTimeWaiting: number;
    minCompletedCycles: number;
  };
}

/**
 * Find best match for a donor
 * Uses algorithm based on:
 * - Trust score
 * - Location proximity
 * - Time waiting
 * - Amount needed
 * - Force recycle qualification (NEW!)
 */
export async function findBestMatch(
  donorId: string,
  amount: number,
  preferences: MatchPreferences = {}
) {
  // Find users who need donations (have pending obligations or are new)
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: donorId },
      isActive: true,
      isBanned: false,
      kycStatus: 'approved',
      ...(preferences.location && {
        locationCity: preferences.location,
      }),
    },
    include: {
      wallet: true,
      cycles: {
        where: { status: 'pending' },
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
    take: 100, // Consider more candidates for force recycle filtering
  });

  if (candidates.length === 0) {
    return null;
  }

  // Filter out users who don't qualify (force recycle check)
  const qualifiedCandidates = [];
  
  for (const candidate of candidates) {
    const qualification = await checkUserQualifiesForReceipt(candidate.id);
    
    if (qualification.qualifies) {
      qualifiedCandidates.push({
        ...candidate,
        qualification,
      });
    } else {
      logger.info(`User ${candidate.id} excluded from matching: ${qualification.reason}`);
    }
  }

  if (qualifiedCandidates.length === 0) {
    logger.warn('No qualified recipients found (all need to complete 2nd donation)');
    return null;
  }

  // Score each qualified candidate using AI-enhanced algorithm
  const scoredCandidates = await Promise.all(qualifiedCandidates.map(async (candidate) => {
    let score = 0;

    // Extract user features for AI model
    const features: UserFeatures = {
      trustScore: Number(candidate.trustScore),
      locationProximity: preferences.location && candidate.locationCity === preferences.location ? 1 : 0,
      timeWaiting: candidate.cycles.length > 0 ?
        Math.floor((Date.now() - candidate.cycles[0].createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0,
      completedCycles: candidate.qualification.completedCycles,
      donationHistory: await getUserDonationHistory(candidate.id),
      categoryPreference: 0, // Would be calculated based on donation categories
      age: calculateAge(candidate.dateOfBirth),
      accountAge: Math.floor((Date.now() - candidate.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    };

    // Use AI model for scoring if available, fallback to rule-based
    try {
      score = await predictMatchScore(features, amount);
    } catch (error) {
      logger.warn('AI scoring failed, using rule-based scoring', { error: error.message });
      score = calculateRuleBasedScore(candidate, preferences, features);
    }

    return {
      ...candidate,
      score,
      features
    };
  }));

  // Sort by score (highest first)
  scoredCandidates.sort((a, b) => b.score - a.score);

  const bestMatch = scoredCandidates[0];

  if (!bestMatch) {
    return null;
  }

  // Create match record
  const match = await prisma.match.create({
    data: {
      donorId,
      recipientId: bestMatch.id,
      amount,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 