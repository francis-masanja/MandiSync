import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const MIGRATIONS_DIR = path.join(process.cwd(), 'prisma', 'migrations');

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _mandisync_migrations (
      name TEXT NOT NULL PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const applied = new Set(
    (await client.execute('SELECT name FROM _mandisync_migrations')).rows.map((row) =>
      String(row.name)
    )
  );

  const tables = (
    await client.execute("SELECT name FROM sqlite_master WHERE type = 'table'")
  ).rows.map((row) => String(row.name));

  if (applied.size === 0 && (tables.includes('users') || tables.includes('bookings'))) {
    console.error(
      'This database already has MandiSync tables but no migration record. Refusing to run the destructive init migration. Back up and recreate the database, or add the migration records manually.'
    );
    process.exit(1);
  }

  const folders = fs
    .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const folder of folders) {
    if (applied.has(folder)) {
      console.log(`skip ${folder}`);
      continue;
    }
    const file = path.join(MIGRATIONS_DIR, folder, 'migration.sql');
    if (!fs.existsSync(file)) continue;
    const sql = fs.readFileSync(file, 'utf8');
    console.log(`apply ${folder}`);
    await client.executeMultiple(sql);
    await client.execute({
      sql: 'INSERT INTO _mandisync_migrations (name, applied_at) VALUES (?, ?)',
      args: [folder, new Date().toISOString()],
    });
  }

  console.log('Migrations are up to date.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
