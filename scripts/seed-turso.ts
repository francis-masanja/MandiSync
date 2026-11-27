import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const adapter = new PrismaLibSql({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const prisma = new PrismaClient({ adapter });

const users = [
  { id: 'U1', name: 'Farmer Demo', email: 'farmer@example.com', password: 'farmer123', role: 'farmer' },
  { id: 'U2', name: 'Operator Demo', email: 'operator@example.com', password: 'operator123', role: 'operator' },
  { id: 'U3', name: 'Admin Demo', email: 'admin@example.com', password: 'admin123', role: 'admin' },
];

const mandis = [
  {
    id: 'mandi-01',
    name: 'Karnal Central APMC Mandi',
    location: 'Karnal, Haryana',
    latitude: 29.6857,
    longitude: 76.9905,
    maxDailyKg: 10000,
    allocatedTodayKg: 5500,
    activeQueueCount: 3,
    avgWaitMinutes: 25,
  },
  {
    id: 'mandi-02',
    name: 'Khanna Grain Mega Market',
    location: 'Ludhiana, Punjab',
    latitude: 30.7071,
    longitude: 76.2167,
    maxDailyKg: 15000,
    allocatedTodayKg: 7200,
    activeQueueCount: 5,
    avgWaitMinutes: 35,
  },
  {
    id: 'mandi-03',
    name: 'Kota Bhamashah Krishi Mandi',
    location: 'Kota, Rajasthan',
    latitude: 25.1843,
    longitude: 75.8427,
    maxDailyKg: 8000,
    allocatedTodayKg: 4100,
    activeQueueCount: 2,
    avgWaitMinutes: 20,
  },
  {
    id: 'mandi-04',
    name: 'Indore Laxmibai Nagar Mandi',
    location: 'Indore, Madhya Pradesh',
    latitude: 22.7533,
    longitude: 75.8937,
    maxDailyKg: 12000,
    allocatedTodayKg: 6800,
    activeQueueCount: 4,
    avgWaitMinutes: 30,
  },
];

async function main() {
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, name: u.name, role: u.role },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
      },
    });
  }

  for (const mandi of mandis) {
    await prisma.mandi.upsert({
      where: { id: mandi.id },
      update: {
        name: mandi.name,
        location: mandi.location,
        latitude: mandi.latitude,
        longitude: mandi.longitude,
        maxDailyKg: mandi.maxDailyKg,
        allocatedTodayKg: mandi.allocatedTodayKg,
        activeQueueCount: mandi.activeQueueCount,
        avgWaitMinutes: mandi.avgWaitMinutes,
      },
      create: mandi,
    });
  }

  console.log(`✅ Seeded ${users.length} demo users and ${mandis.length} mandis.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
