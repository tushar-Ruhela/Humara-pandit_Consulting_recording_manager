import { PrismaClient } from '@prisma/client';

// Single shared Prisma client for the whole app
const db = new PrismaClient();

export default db;
