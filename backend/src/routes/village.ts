import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getVillage,
  collectIdleResources,
  buildBuilding,
  finishConstruction,
  depositResources
} from '../controllers/villageController';

const router = Router();

router.use(authMiddleware);

router.get('/', getVillage);
router.post('/collect', collectIdleResources);
router.post('/build', buildBuilding);
router.post('/finish-construction', finishConstruction);
router.post('/deposit', depositResources);

export default router;