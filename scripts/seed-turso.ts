import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  { id: 'U1', name: 'Farmer Demo', email: 'farmer@example.com', password: 'farmer123', role: 'farmer' },
  { id: 'U2', name: 'Operator Demo', email: 'operator@example.com', password: 'operator123', role: 'operator' },
  { id: 'U3', name: 'Admin Demo', email: 'admin@example.com', password: 'admin123', role: 'admin' },
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
  console.log('✅ Demo users seeded to Turso');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });