import { Router } from 'express';
import authRoutes from './auth.routes';
import recordingRoutes from './recording.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/recordings', recordingRoutes);

export default router;
