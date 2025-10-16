import { Request, Response } from 'express';
import { SyncService } from '../services/sync.service';

export class SyncController {
  static async syncData(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const syncData = req.body;

      const result = await SyncService.syncUserData(userId, syncData);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Sync failed',
      });
    }
  }

  static async getUpdates(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { lastSync } = req.query;

      const updates = await SyncService.getUpdates(userId, lastSync as string);
      
      res.json({
        success: true,
        data: updates,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get updates',
      });
    }
  }
}