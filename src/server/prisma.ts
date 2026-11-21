import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

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

// Export a lazily-initialized singleton
const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const client = getPrismaClient();
    return Reflect.get(client, prop, receiver);
  }
});

export default prisma;