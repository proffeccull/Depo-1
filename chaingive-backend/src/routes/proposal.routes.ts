
import { Router } from 'express';
import * as proposalController from '../controllers/proposal.controller';
import { authenticate } from '../middleware/auth';
// Input validation can be added here later if needed
// import { validate } from '../middleware/validation';
// import * as proposalValidation from '../validations/proposal.validation';

const router = Router();

/**
 * @route   GET /v1/proposals
 * @desc    Get all proposals
 * @access  Public
 */
router.get('/', proposalController.getProposalsHandler);

/**
 * @route   GET /v1/proposals/:id
 * @desc    Get a single proposal by its ID
 * @access  Public
 */
router.get('/:id', proposalController.getProposalByIdHandler);

/**
 * @route   GET /v1/proposals/:id/results
 * @desc    Get the vote results for a proposal
 * @access  Public
 */
router.get('/:id/results', proposalController.getVoteResultsHandler);

// All routes below are protected
router.use(authenticate);

/**
 * @route   POST /v1/proposals
 * @desc    Create a new proposal
 * @access  Private
 */
router.post(
  '/', 
  // validate(proposalValidation.createProposalSchema), // Example of validation
  proposalController.createProposalHandler
);

/**
 * @route   POST /v1/proposals/:id/vote
 * @desc    Vote on a proposal
 * @access  Private
 */
router.post(
  '/:id/vote',
  // validate(proposalValidation.voteSchema), // Example of validation
  proposalController.voteOnProposalHandler
);

export default router;
