import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Community Voting Controller
 * Handles proposal creation, voting, and results
 */

// ============================================
// PROPOSAL MANAGEMENT
// ============================================

/**
 * Get all active proposals
 */
export async function getActiveProposals(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    const proposals = await prisma.proposal.findMany({
      where: {
        status: 'active',
        votingEndsAt: { gt: new Date() },
      },
      include: {
        author: {
          select: { id: true, name: true, trustScore: true },
        },
        votes: {
          where: userId ? { voterId: userId } : undefined,
          select: { voteType: true, createdAt: true },
        },
        _count: {
          select: { votes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate vote counts and user vote status
    const proposalsWithStats = proposals.map(proposal => {
      const totalVotes = proposal._count.votes;
      const userVote = proposal.votes[0];

      // Calculate vote distribution (simplified for now)
      const yesVotes = proposal.votes.filter(v => v.voteType === 'yes').length;
      const noVotes = proposal.votes.filter(v => v.voteType === 'no').length;

      return {
        ...proposal,
        totalVotes,
        yesVotes,
        noVotes,
        abstainVotes: totalVotes - yesVotes - noVotes,
        userVote: userVote || null,
        timeRemaining: Math.max(0, Math.floor((new Date(proposal.votingEndsAt!).getTime() - Date.now()) / (1000 * 60 * 60))), // hours
      };
    });

    res.json({ proposals: proposalsWithStats });
  } catch (error: any) {
    logger.error('Error fetching active proposals:', error);
    res.status(500).json({ error: { message: 'Failed to fetch proposals' } });
  }
}

/**
 * Get proposal details with full vote breakdown
 */
export async function getProposalDetails(req: Request, res: Response) {
  try {
    const { proposalId } = req.params;
    const userId = (req as any).user?.id;

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        author: {
          select: { id: true, name: true, trustScore: true },
        },
        votes: {
          include: {
            voter: {
              select: { id: true, name: true, trustScore: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!proposal) {
      throw new AppError('Proposal not found', 404, 'PROPOSAL_NOT_FOUND');
    }

    // Calculate detailed statistics
    const voteStats = {
      total: proposal.votes.length,
      yes: proposal.votes.filter(v => v.voteType === 'yes').length,
      no: proposal.votes.filter(v => v.voteType === 'no').length,
      abstain: proposal.votes.filter(v => v.voteType === 'abstain').length,
      yesPercentage: 0,
      noPercentage: 0,
      abstainPercentage: 0,
    };

    if (voteStats.total > 0) {
      voteStats.yesPercentage = Math.round((voteStats.yes / voteStats.total) * 100);
      voteStats.noPercentage = Math.round((voteStats.no / voteStats.total) * 100);
      voteStats.abstainPercentage = Math.round((voteStats.abstain / voteStats.total) * 100);
    }

    // Check if user has voted
    const userVote = userId ? proposal.votes.find(v => v.voterId === userId) : null;

    res.json({
      proposal: {
        ...proposal,
        voteStats,
        userVote,
        canVote: !userVote && new Date(proposal.votingEndsAt!) > new Date(),
        isExpired: new Date(proposal.votingEndsAt!) <= new Date(),
      },
    });
  } catch (error: any) {
    logger.error('Error fetching proposal details:', error);
    res.status(500).json({ error: { message: 'Failed to fetch proposal details' } });
  }
}

/**
 * Create a new proposal
 */
export async function createProposal(req: Request, res: Response) {
  try {
    const authorId = (req as any).user.id;
    const { title, description, category, durationHours = 168 } = req.body;

    // Check voting config
    const config = await prisma.voteConfiguration.findFirst();
    if (!config?.votingEnabled) {
      throw new AppError('Voting is currently disabled', 403, 'VOTING_DISABLED');
    }

    // Check user trust score
    const user = await prisma.user.findUnique({
      where: { id: authorId },
      select: { trustScore: true },
    });

    if (!user || user.trustScore < (config?.minTrustScore || 0)) {
      throw new AppError('Insufficient trust score to create proposals', 403, 'INSUFFICIENT_TRUST');
    }

    // Check cooldown
    const recentProposal = await prisma.proposal.findFirst({
      where: {
        authorId: authorId,
        createdAt: {
          gt: new Date(Date.now() - (config?.proposalCooldownHours || 24) * 60 * 60 * 1000),
        },
      },
    });

    if (recentProposal) {
      throw new AppError('Please wait before creating another proposal', 429, 'PROPOSAL_COOLDOWN');
    }

    const votingEndsAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    const proposal = await prisma.proposal.create({
      data: {
        title,
        description,
        category,
        authorId: authorId,
        votingEndsAt,
        rewardCoins: config?.proposalReward || 50,
      },
      include: {
        author: {
          select: { name: true, trustScore: true },
        },
      },
    });

    logger.info(`New proposal created: ${proposal.id} by user ${authorId}`);

    res.status(201).json({
      message: 'Proposal created successfully',
      proposal,
    });
  } catch (error: any) {
    logger.error('Error creating proposal:', error);
    res.status(500).json({ error: { message: 'Failed to create proposal' } });
  }
}

// ============================================
// VOTING ACTIONS
// ============================================

/**
 * Cast a vote on a proposal
 */
export async function castVote(req: Request, res: Response) {
  try {
    const voterId = (req as any).user.id;
    const { proposalId } = req.params;
    const { voteType } = req.body; // 'yes', 'no', 'abstain'

    // Validate vote type
    if (!['yes', 'no', 'abstain'].includes(voteType)) {
      throw new AppError('Invalid vote type', 400, 'INVALID_VOTE_TYPE');
    }

    // Check voting config
    const config = await prisma.voteConfiguration.findFirst();
    if (!config?.votingEnabled) {
      throw new AppError('Voting is currently disabled', 403, 'VOTING_DISABLED');
    }

    // Get proposal
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal || proposal.status !== 'active') {
      throw new AppError('Proposal not found or not active', 404, 'PROPOSAL_NOT_ACTIVE');
    }

    if (new Date(proposal.votingEndsAt!) <= new Date()) {
      throw new AppError('Voting has ended for this proposal', 400, 'VOTING_ENDED');
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        proposalId_voterId: {
          voterId,
          proposalId,
        },
      },
    });

    if (existingVote) {
      throw new AppError('You have already voted on this proposal', 409, 'ALREADY_VOTED');
    }

    // Check vote cooldown
    const recentVote = await prisma.vote.findFirst({
      where: {
        voterId,
        createdAt: {
          gt: new Date(Date.now() - (config?.voteCooldownHours || 1) * 60 * 60 * 1000),
        },
      },
    });

    if (recentVote) {
      throw new AppError('Please wait before voting again', 429, 'VOTE_COOLDOWN');
    }

    // Get user trust score for vote power
    const user = await prisma.user.findUnique({
      where: { id: voterId },
      select: { trustScore: true },
    });

    const votePower = Math.max(0.1, user?.trustScore || 0); // Minimum 0.1 vote power

    // Cast vote
    const vote = await prisma.vote.create({
      data: {
        voterId,
        proposalId,
        voteType,
        votePower,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    // Award voting reward
    if (config?.baseVoteReward && config.baseVoteReward > 0) {
      await prisma.user.update({
        where: { id: voterId },
        data: {
          charityCoinsBalance: { increment: config.baseVoteReward },
        },
      });
    }

    logger.info(`Vote cast: ${vote.id} by user ${voterId} on proposal ${proposalId}`);

    res.json({
      message: 'Vote cast successfully',
      vote: {
        id: vote.id,
        voteType,
        votePower,
        createdAt: vote.createdAt,
      },
      rewardEarned: config?.baseVoteReward || 0,
    });
  } catch (error: any) {
    logger.error('Error casting vote:', error);
    res.status(500).json({ error: { message: 'Failed to cast vote' } });
  }
}

/**
 * Get user's voting history
 */
export async function getUserVotingHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const votes = await prisma.vote.findMany({
      where: { voterId: userId },
      include: {
        proposal: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            votingEndsAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ votes });
  } catch (error: any) {
    logger.error('Error fetching voting history:', error);
    res.status(500).json({ error: { message: 'Failed to fetch voting history' } });
  }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Get voting statistics (Admin only)
 */
export async function getVotingStats(req: Request, res: Response) {
  try {
    const totalProposals = await prisma.proposal.count();
    const activeProposals = await prisma.proposal.count({
      where: { status: 'active', votingEndsAt: { gt: new Date() } },
    });
    const totalVotes = await prisma.vote.count();
    const uniqueVoters = await prisma.vote.findMany({
      select: { voterId: true },
      distinct: ['voterId'],
    });

    const recentVotes = await prisma.vote.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        voter: { select: { name: true } },
        proposal: { select: { title: true } },
      },
    });

    res.json({
      stats: {
        totalProposals,
        activeProposals,
        totalVotes,
        uniqueVoters: uniqueVoters.length,
        recentVotes,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching voting stats:', error);
    res.status(500).json({ error: { message: 'Failed to fetch voting stats' } });
  }
}
