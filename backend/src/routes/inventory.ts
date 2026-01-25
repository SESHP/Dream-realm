import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { addCrystal } from '../controllers/inventoryController';

const router = Router();

router.post('/add-crystal', authMiddleware, addCrystal);

export default router;