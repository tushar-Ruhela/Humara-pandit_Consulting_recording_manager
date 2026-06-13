import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Always log the real error server-side only
  console.error('[Error]', err?.message || err);

  // 1. Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.issues,
    });
  }

  // 2. Prisma known errors (database-level)
  if (err?.code) {
    // Unique constraint violation (e.g. email already exists)
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Resource not found.' });
    }
    // Database connection / migration issues (P1xxx / P2xxx codes)
    if (err.code.startsWith('P1') || err.code.startsWith('P2')) {
      return res.status(503).json({ message: 'Database error. Please try again later.' });
    }
  }

  // 3. App-level errors thrown with a status (e.g. 401 Invalid credentials)
  if (err?.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  // 4. Everything else → generic 500, never expose internals
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
};
