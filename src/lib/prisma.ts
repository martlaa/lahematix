import { PrismaClient } from '@prisma/client';

// Standardne Next.js muster: dev-režiimis hot-reload ei tohi luua iga kord
// uut PrismaClient'i (muidu jooksevad andmebaasi ühendused kiiresti otsa).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
