import { Router } from 'express';
import { CorporateController } from '../controllers/corporate.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as corporateValidation from '../validations/corporate.validation';

const router = Router();
const corporateController = new CorporateController();

// All routes require authentication
router.use(auth);

/**
 * @route POST /corporate
 * @desc Create a new corporate account
 * @access Private (User)
 */
router.post('/register', corporateValidation.createCorporateValidation, corporateController.registerCorporate);

/**
 * @route GET /corporate/:corporateId
 * @desc Get corporate account details
 * @access Private (Corporate Owner or Admin)
 */
router.get('/:corporateId', corporateValidation.corporateIdValidation, corporateController.getCorporate);

/**
 * @route POST /corporate/bulk-donation
 * @desc Create bulk donation
 * @access Private (Corporate)
 */
router.post('/bulk-donation', corporateValidation.createBulkDonationValidation, corporateController.createBulkDonation);

/**
 * @route POST /corporate/bulk-donation/:bulkDonationId/process
 * @desc Process bulk donation
 * @access Private (Corporate)
 */
router.post('/bulk-donation/:bulkDonationId/process', corporateValidation.processBulkDonationValidation, corporateController.processBulkDonation);

/**
 * @route GET /corporate/:corporateId/donations
 * @desc Get corporate donations
 * @access Private (Corporate Owner or Admin)
 */
router.get('/:corporateId/donations', corporateValidation.corporateDonationsValidation, corporateController.getCorporateDonations);

/**
 * @route GET /corporate/:corporateId/analytics
 * @desc Get corporate analytics
 * @access Private (Corporate Owner or Admin)
 */
router.get('/:corporateId/analytics', corporateValidation.corporateAnalyticsValidation, corporateController.getCorporateAnalytics);

/**
 * @route POST /corporate/:corporateId/team
 * @desc Add team member
 * @access Private (Corporate Owner or Admin)
 */
router.post('/:corporateId/team', corporateValidation.addTeamMemberValidation, corporateController.addTeamMember);

/**
 * @route DELETE /corporate/:corporateId/team/:userId
 * @desc Remove team member
 * @access Private (Corporate Owner or Admin)
 */
router.delete('/:corporateId/team/:userId', corporateValidation.removeTeamMemberValidation, corporateController.removeTeamMember);

/**
 * @route GET /corporate/:corporateId/team
 * @desc Get team members
 * @access Private (Corporate Owner or Admin)
 */
router.get('/:corporateId/team', corporateValidation.getTeamMembersValidation, corporateController.getTeamMembers);

/**
 * @route PUT /corporate/:corporateId/status
 * @desc Update corporate status
 * @access Private (Admin)
 */
router.put('/:corporateId/status', corporateValidation.updateCorporateStatusValidation, corporateController.updateCorporateStatus);

export default router;
