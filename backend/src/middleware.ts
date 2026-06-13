import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ZodSchema } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// ─── Auth middleware ───────────────────────────────────────────────────────────
// Reads the Bearer token from the Authorization header and attaches the decoded
// user payload to req.user. Returns 401 if the token is missing or invalid.

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

// ─── Validation middleware ─────────────────────────────────────────────────────
// Takes a Zod schema, validates req.body against it, and either calls next()
// or returns a 400 with the first validation error message.

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

// ─── Global error handler ──────────────────────────────────────────────────────
// Registered as the last middleware in index.ts. Catches errors thrown anywhere
// in the app and maps them to clean JSON responses. The real error is only
// logged on the server — never sent to the client.

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err?.message || err);

  // Prisma unique constraint (e.g. duplicate email on register)
  if (err?.code === 'P2002') {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }

  // Prisma record not found
  if (err?.code === 'P2025') {
    res.status(404).json({ message: 'Record not found.' });
    return;
  }

  // Any other Prisma / database error
  if (err?.code?.startsWith('P')) {
    res.status(503).json({ message: 'Database error. Please try again later.' });
    return;
  }

  // App-level errors with a specific status (e.g. 401, 409)
  if (err?.status && err.status < 500) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  // Catch-all — never expose internals to the client
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
