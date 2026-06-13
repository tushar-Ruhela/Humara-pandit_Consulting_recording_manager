import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from './db';
import { validate } from './middleware';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// ─── Validation schemas ────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if a user with this email already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'An account with this email already exists.' });
      return;
    }

    // Hash the password before saving (bcrypt, salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to the database
    const user = await db.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Sign a JWT token valid for JWT_EXPIRES_IN (default 1 day)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    next(err); // passes to global errorHandler in middleware.ts
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Look up the user by email
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // Compare the submitted password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // Sign a JWT and return it with the user profile
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
