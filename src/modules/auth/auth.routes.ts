import { Router } from 'express';
import { loginController, logoutController, meController, refreshController, registerController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);
router.get('/me', authMiddleware, meController);

export default router;
