import { Request, Response } from 'express';
import analyticsDashboardService from '../services/analytics-dashboard.service';
import logger from '../utils/logger';

export async function getDonationTrends(req: Request, res: Response) {
  try {
    const { period = '30d' } = req.query;
    const trends = await analyticsDashboardService.getDonationTrends(period as string);
    res.json(trends);
  } catch (error: any) {
    logger.error('Error fetching donation trends:', error);
    res.status(500).json({ error: { message: 'Failed to fetch trends' } });
  }
}

export async function getUserEngagement(req: Request, res: Response) {
  try {
    const metrics = await analyticsDashboardService.getUserEngagement();
    res.json(metrics);
  } catch (error: any) {
    logger.error('Error fetching engagement:', error);
    res.status(500).json({ error: { message: 'Failed to fetch engagement' } });
  }
}

export async function getConversionFunnel(req: Request, res: Response) {
  try {
    const funnel = await analyticsDashboardService.getConversionFunnel();
    res.json(funnel);
  } catch (error: any) {
    logger.error('Error fetching funnel:', error);
    res.status(500).json({ error: { message: 'Failed to fetch funnel' } });
  }
}

export async function getDonationHeatmap(req: Request, res: Response) {
  try {
    const heatmap = await analyticsDashboardService.getDonationHeatmap();
    res.json(heatmap);
  } catch (error: any) {
    logger.error('Error fetching heatmap:', error);
    res.status(500).json({ error: { message: 'Failed to fetch heatmap' } });
  }
}

export async function getOverviewStats(req: Request, res: Response) {
  try {
    const stats = await analyticsDashboardService.getOverviewStats();
    res.json(stats);
  } catch (error: any) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: { message: 'Failed to fetch stats' } });
  }
}
