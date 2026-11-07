import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { meController } from './users.controller';

const router = Router();

router.get('/me', authMiddleware, meController);

export default router;
