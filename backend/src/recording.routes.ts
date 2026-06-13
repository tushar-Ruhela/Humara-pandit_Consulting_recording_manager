import { Router } from 'express';
import db from './db';
import { upload } from './config';
import { authenticate, AuthRequest } from './middleware';

const router = Router();


router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const recordings = await db.recording.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ recordings });
  } catch (err) {
    next(err);
  }
});


router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded.' });
      return;
    }

    const { title, description } = req.body;

    const recording = await db.recording.create({
      data: {
        title: title || req.file.originalname,
        description: description || null,
        cloudinaryUrl: (req.file as any).path,
        userId: req.user!.userId,
      },
    });

    res.status(201).json({ recording });
  } catch (err) {
    next(err);
  }
});


router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;

    const recording = await db.recording.findUnique({ where: { id } });

    if (!recording || recording.userId !== req.user!.userId) {
      res.status(404).json({ message: 'Recording not found.' });
      return;
    }

    await db.recording.delete({ where: { id } });

    res.status(200).json({ message: 'Recording deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
