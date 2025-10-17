import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as recurringDonationController from '../controllers/recurring-donation.controller';

const router = Router();

router.use(authenticate);

router.post('/', recurringDonationController.createRecurringDonation);
router.get('/', recurringDonationController.getRecurringDonations);
router.patch('/:id/pause', recurringDonationController.pauseRecurringDonation);
router.patch('/:id/resume', recurringDonationController.resumeRecurringDonation);
router.delete('/:id', recurringDonationController.cancelRecurringDonation);

export default router;
