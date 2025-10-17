
import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Create a new proposal
 * @param userId - The ID of the user creating the proposal
 * @param title - The title of the proposal
 * @param description - The description of the proposal
 * @returns The created proposal
 */
export const createProposal = async (userId: string, title: string, description: string) => {
  try {
    const proposal = await prisma.proposal.create({
      data: {
        userId,
        title,
        description,
      },
    });
    logger.info(`Proposal created: ${proposal.id} by user ${userId}`);
    return proposal;
  } catch (error) {
    logger.error('Error creating proposal:', error);
    throw new Error('Could not create proposal.');
  }
};

/**
 * Get all proposals
 * @returns A list of all proposals
 */
export const getProposals = async () => {
  try {
    return await prisma.proposal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              }
            }
          }
        },
        _count: {
          select: { votes: true },
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching proposals:', error);
    throw new Error('Could not fetch proposals.');
  }
};

/**
 * Get a single proposal by its ID
 * @param proposalId - The ID of the proposal
 * @returns The proposal details
 */
export const getProposalById = async (proposalId: string) => {
  try {
    return await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        user: {
          select: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              }
            }
          }
        },
        votes: {
          include: {
            user: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  }
                }
              }
            }
          }
        }
      },
    });
  } catch (error) {
    logger.error(`Error fetching proposal ${proposalId}:`, error);
    throw new Error('Could not fetch proposal.');
  }
};

/**
 * Vote on a proposal
 * @param userId - The ID of the user voting
 * @param proposalId - The ID of the proposal to vote on
 * @param support - Whether the user supports the proposal or not
 * @returns The created vote
 */
export const voteOnProposal = async (userId: string, proposalId: string, support: boolean) => {
  try {
    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        proposalId_userId: {
          proposalId,
          userId,
        },
      },
    });

    if (existingVote) {
      throw new Error('User has already voted on this proposal.');
    }

    const vote = await prisma.vote.create({
      data: {
        userId,
        proposalId,
        support,
      },
    });
    logger.info(`User ${userId} voted on proposal ${proposalId}`);
    return vote;
  } catch (error) {
    logger.error(`Error voting on proposal ${proposalId}:`, error);
    throw error; // Re-throw to be handled by controller
  }
};

/**
 * Get the results of a proposal's vote
 * @param proposalId - The ID of the proposal
 * @returns The vote counts for and against the proposal
 */
export const getVoteResults = async (proposalId: string) => {
  try {
    const results = await prisma.vote.groupBy({
      by: ['support'],
      where: { proposalId },
      _count: {
        support: true,
      },
    });

    const supportCount = results.find(r => r.support === true)?._count.support || 0;
    const againstCount = results.find(r => r.support === false)?._count.support || 0;
    const totalVotes = supportCount + againstCount;

    return {
      proposalId,
      supportCount,
      againstCount,
      totalVotes,
    };
  } catch (error) {
    logger.error(`Error getting vote results for proposal ${proposalId}:`, error);
    throw new Error('Could not get vote results.');
  }
};
