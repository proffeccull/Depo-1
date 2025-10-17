import { Request, Response } from 'express';
import fundraisingService from '../services/fundraising.service';
import logger from '../utils/logger';

export async function getThermometer(req: Request, res: Response) {
  try {
    const { categoryId } = req.params;
    const thermometer = await fundraisingService.getThermometerData(categoryId);
    res.json(thermometer);
  } catch (error: any) {
    logger.error('Error fetching thermometer:', error);
    res.status(500).json({ error: { message: 'Failed to fetch thermometer data' } });
  }
}

export async function getLeaderboardWithBadges(req: Request, res: Response) {
  try {
    const { type = 'donations', period = 'all' } = req.query;
    const leaderboard = await fundraisingService.getLeaderboardWithBadges(
      type as string,
      period as string
    );
    res.json(leaderboard);
  } catch (error: any) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: { message: 'Failed to fetch leaderboard' } });
  }
}

export async function getUserBadges(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const badges = await fundraisingService.getUserBadges(userId);
    res.json({ badges });
  } catch (error: any) {
    logger.error('Error fetching badges:', error);
    res.status(500).json({ error: { message: 'Failed to fetch badges' } });
  }
}
