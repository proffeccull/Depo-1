import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { authMiddleware } from '../middleware/auth';
export { authMiddleware };

const router = Router();

router.post('/sync', authMiddleware, SyncController.syncData);
router.get('/updates', authMiddleware, SyncController.getUpdates);

export default router;