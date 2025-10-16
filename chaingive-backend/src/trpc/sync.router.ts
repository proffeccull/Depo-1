import { z } from 'zod';
import { router, protectedProcedure } from './router';
import { SyncService } from '../services/sync.service';

export const syncRouter = router({
  syncData: protectedProcedure
    .input(z.object({
      transactions: z.array(z.any()),
      lastSync: z.string(),
      deviceId: z.string(),
    }))
    .mutation(async ({ input }) => {
      return SyncService.syncUserData('1', input);
    }),

  getUpdates: protectedProcedure
    .input(z.object({
      lastSync: z.string(),
    }))
    .query(async ({ input }) => {
      return SyncService.getUpdates('1', input.lastSync);
    }),
});