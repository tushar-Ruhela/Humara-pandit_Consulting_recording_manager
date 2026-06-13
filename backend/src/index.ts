import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './auth.routes';
import recordingRoutes from './recording.routes';
import { errorHandler } from './middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & parsing middleware ─────────────────────────────────────────────
app.use(helmet());                                         // sets secure HTTP headers
app.use(cors({ origin: process.env.FRONTEND_URL || '*' })); // allow frontend origin
app.use(express.json());                                   // parse JSON request bodies

// ─── Rate limiting ─────────────────────────────────────────────────────────────
// Max 100 requests per IP per 15 minutes — prevents brute-force attacks
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/recordings', recordingRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
