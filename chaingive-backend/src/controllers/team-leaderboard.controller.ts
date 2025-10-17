import { Request, Response } from 'express';
import teamLeaderboardService from '../services/team-leaderboard.service';

export async function getTeamLeaderboard(req: Request, res: Response) {
  try {
    const { period = 'all' } = req.query;
    const leaderboard = await teamLeaderboardService.getTeamLeaderboard(period as string);
    res.json({ leaderboard });
  } catch (error: any) {
    res.status(500).json({ error: { message: 'Failed to fetch team leaderboard' } });
  }
}
