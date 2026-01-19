import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { 
  getCharacter, 
  moveCharacter, 
  startGathering, 
  finishGathering 
} from '../controllers/characterController';

const router = Router();

router.use(authMiddleware);

router.get('/', getCharacter);
router.post('/move', moveCharacter);
router.post('/gather/start', startGathering);
router.post('/gather/finish', finishGathering);

export default router;