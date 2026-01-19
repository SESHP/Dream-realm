import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getMapResources, seedMapResources, respawnResources } from '../controllers/mapController';

const router = Router();

router.use(authMiddleware);

router.get('/resources', getMapResources);
router.post('/seed', seedMapResources);
router.post('/respawn', respawnResources);

export default router;