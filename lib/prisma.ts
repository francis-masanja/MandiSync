import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  console.error('[PRISMA] Creating client, DATABASE_URL:', databaseUrl ? 'SET' : 'MISSING');
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const libsql = createClient({
    url: databaseUrl,
  });

  const adapter = new PrismaLibSql({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  return prisma;
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  
  const prisma = createPrismaClient();
  globalForPrisma.prisma = prisma;
  
  return prisma;
}

// Export a function that returns the client - ensures lazy initialization
export function getClient(): PrismaClient {
  return getPrismaClient();
}

// Also export the instance directly for backward compatibility
const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const client = getPrismaClient();
    return Reflect.get(client, prop, receiver);
  }
});

export default prisma;