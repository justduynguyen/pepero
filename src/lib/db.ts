import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Create a connection pool
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10 // Connection pool size
});

// Create adapter and client
const adapter = new PrismaPg(pool);

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
