
import { Request, Response } from 'express';
import * as proposalService from '../services/proposal.service';
import logger from '../utils/logger';

/**
 * Handler to create a new proposal
 */
export const createProposalHandler = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id; // Assuming user ID is attached by auth middleware
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  try {
    const proposal = await proposalService.createProposal(userId, title, description);
    res.status(201).json(proposal);
  } catch (error: any) {
    logger.error('Error in createProposalHandler:', error);
    res.status(500).json({ message: 'Failed to create proposal.', error: error.message });
  }
};

/**
 * Handler to get all proposals
 */
export const getProposalsHandler = async (req: Request, res: Response) => {
  try {
    const proposals = await proposalService.getProposals();
    res.status(200).json(proposals);
  } catch (error: any) {
    logger.error('Error in getProposalsHandler:', error);
    res.status(500).json({ message: 'Failed to fetch proposals.', error: error.message });
  }
};

/**
 * Handler to get a single proposal by ID
 */
export const getProposalByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const proposal = await proposalService.getProposalById(id);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found.' });
    }
    res.status(200).json(proposal);
  } catch (error: any) {
    logger.error(`Error in getProposalByIdHandler for id ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch proposal.', error: error.message });
  }
};

/**
 * Handler to vote on a proposal
 */
export const voteOnProposalHandler = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const { id: proposalId } = req.params;
  const { support } = req.body; // support is a boolean

  if (typeof support !== 'boolean') {
    return res.status(400).json({ message: "support must be a boolean value." });
  }

  try {
    const vote = await proposalService.voteOnProposal(userId, proposalId, support);
    res.status(201).json(vote);
  } catch (error: any) {
    logger.error(`Error in voteOnProposalHandler for proposal ${proposalId}:`, error);
    if (error.message === 'User has already voted on this proposal.') {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to vote on proposal.', error: error.message });
  }
};

/**
 * Handler to get the results of a proposal's vote
 */
export const getVoteResultsHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const results = await proposalService.getVoteResults(id);
    res.status(200).json(results);
  } catch (error: any) {
    logger.error(`Error in getVoteResultsHandler for id ${id}:`, error);
    res.status(500).json({ message: 'Failed to get vote results.', error: error.message });
  }
};
