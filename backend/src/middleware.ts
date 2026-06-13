import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ZodSchema } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';


export interface AuthRequest extends Request {
  user?: { userId: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}


export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message || 'Invalid input';
      res.status(400).json({ message });
      return;
    }
    next();
  };
}


export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err?.message || err);

  if (err?.code === 'P2002') {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  if (err?.code === 'P2025') {
    res.status(404).json({ message: 'Record not found.' });
    return;
  }

  if (err?.code?.startsWith('P')) {
    res.status(503).json({ message: 'Database error. Please try again later.' });
    return;
  }


  if (err?.status && err.status < 500) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
