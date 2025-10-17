import { Request, Response } from 'express';
import recurringDonationService from '../services/recurring-donation.service';
import logger from '../utils/logger';

export async function createRecurringDonation(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { amount, categoryId, frequency, startDate } = req.body;

    const subscription = await recurringDonationService.create({
      userId,
      amount,
      categoryId,
      frequency,
      startDate: new Date(startDate),
    });

    res.status(201).json({ subscription });
  } catch (error: any) {
    logger.error('Error creating recurring donation:', error);
    res.status(500).json({ error: { message: 'Failed to create recurring donation' } });
  }
}

export async function getRecurringDonations(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const subscriptions = await recurringDonationService.getUserSubscriptions(userId);
    res.json({ subscriptions });
  } catch (error: any) {
    logger.error('Error fetching recurring donations:', error);
    res.status(500).json({ error: { message: 'Failed to fetch recurring donations' } });
  }
}

export async function pauseRecurringDonation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await recurringDonationService.pause(id);
    res.json({ message: 'Recurring donation paused' });
  } catch (error: any) {
    logger.error('Error pausing recurring donation:', error);
    res.status(500).json({ error: { message: 'Failed to pause recurring donation' } });
  }
}

export async function resumeRecurringDonation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await recurringDonationService.resume(id);
    res.json({ message: 'Recurring donation resumed' });
  } catch (error: any) {
    logger.error('Error resuming recurring donation:', error);
    res.status(500).json({ error: { message: 'Failed to resume recurring donation' } });
  }
}

export async function cancelRecurringDonation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await recurringDonationService.cancel(id);
    res.json({ message: 'Recurring donation cancelled' });
  } catch (error: any) {
    logger.error('Error cancelling recurring donation:', error);
    res.status(500).json({ error: { message: 'Failed to cancel recurring donation' } });
  }
}
