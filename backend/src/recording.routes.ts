import { Router } from 'express';
import db from './db';
import { upload } from './config';
import { authenticate, AuthRequest } from './middleware';

const router = Router();

// All recording routes require a valid JWT — authenticate runs first

// ─── GET /api/recordings ───────────────────────────────────────────────────────
// Returns all recordings that belong to the logged-in user

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

// ─── POST /api/recordings ──────────────────────────────────────────────────────
// Uploads a recording file to Cloudinary and saves its metadata to the database.
// The file is handled by multer (upload.single), which puts file info on req.file.

router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded.' });
      return;
    }

    const { title, description } = req.body;

    // Save the recording metadata to the database
    const recording = await db.recording.create({
      data: {
        title: title || req.file.originalname,
        description: description || null,
        cloudinaryUrl: (req.file as any).path, // Cloudinary URL returned by multer-storage-cloudinary
        userId: req.user!.userId,
      },
    });

    res.status(201).json({ recording });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/recordings/:id ───────────────────────────────────────────────
// Deletes a recording — only if it belongs to the logged-in user

router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string;

    // Make sure the recording exists and belongs to this user before deleting
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
