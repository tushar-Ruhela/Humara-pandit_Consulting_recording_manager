import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../config/cloudinary';

const router = Router();

// Mock endpoints for recordings
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Get all recordings' });
});

router.post('/', authenticate, upload.single('file'), (req, res) => {
  res.json({ message: 'Recording uploaded', file: req.file });
});

export default router;
