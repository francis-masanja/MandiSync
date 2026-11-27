import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'farmer' | 'operator' | 'admin';
};

export type CreateUserResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'exists' | 'readonly' };

/** Absolute path to the JSON file that stores demo users. */
const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

/** Load and parse the users JSON file. Returns an empty array if the file does not exist. */
const loadUsers = (): User[] => {
  if (!fs.existsSync(USERS_PATH)) return [];
  const raw = fs.readFileSync(USERS_PATH, 'utf-8');
  try {
    return JSON.parse(raw) as User[];
  } catch (e) {
    // If the JSON is malformed we fail safe by returning an empty array.
    console.error('Failed to parse users.json:', e);
    return [];
  }
};

/**
 * Find a user by email (case-insensitive).
 *
 * The demo user file is the primary store. When a database is configured it
 * is used as a fallback, because serverless deployments cannot write to the
 * file (see `createUser`).
 */
export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const lower = email.toLowerCase();
  const fileUser = loadUsers().find((u) => u.email.toLowerCase() === lower);
  if (fileUser) return fileUser;

  if (!process.env.DATABASE_URL) return undefined;

  try {
    const { default: prisma } = await import('@/server/prisma');
    const dbUser = await prisma.user.findUnique({ where: { email: lower } });
    if (!dbUser) return undefined;
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      role: dbUser.role as User['role'],
    };
  } catch (error) {
    console.error('Could not look up the user in the database:', error);
    return undefined;
  }
};

/**
 * Persist a new farmer account in the demo user file.
 *
 * The file store is the source used by NextAuth today. Writes are serialised
 * inside this process and written to a temporary file before the rename, so a
 * crash cannot leave a half-written user list.
 */
let writeChain: Promise<unknown> = Promise.resolve();

async function mirrorToDatabase(user: User): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const { default: prisma } = await import('@/server/prisma');
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
      },
    });
    return true;
  } catch (error) {
    // The file store still works if a local database has not been migrated.
    console.error('Could not mirror the new user into the database:', error);
    return false;
  }
}

export function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<CreateUserResult> {
  const run = writeChain.then(async (): Promise<CreateUserResult> => {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const users = loadUsers();

    if (users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, reason: 'exists' };
    }

    // On a read-only deployment the file store does not know about accounts
    // created in the database. Check the database too before writing, so a
    // second sign-up cannot replace an existing password.
    if (process.env.DATABASE_URL) {
      try {
        const { default: prisma } = await import('@/server/prisma');
        const databaseUser = await prisma.user.findUnique({ where: { email } });
        if (databaseUser) return { ok: false, reason: 'exists' };
      } catch (error) {
        console.error('Could not check the database for an existing user:', error);
      }
    }

    const user: User = {
      id: randomUUID(),
      name,
      email,
      passwordHash: input.passwordHash,
      role: 'farmer',
    };

    users.push(user);
    const tempPath = `${USERS_PATH}.tmp`;
    try {
      fs.writeFileSync(tempPath, JSON.stringify(users, null, 2));
      fs.renameSync(tempPath, USERS_PATH);
    } catch (error) {
      // Serverless platforms (e.g. Vercel) ship the app on a read-only
      // filesystem, so new accounts cannot be persisted to data/users.json.
      // Fall back to the database when one is configured and reachable.
      if (await mirrorToDatabase(user)) {
        return { ok: true, user };
      }
      console.error('Could not persist the new user:', error);
      return { ok: false, reason: 'readonly' };
    }

    await mirrorToDatabase(user);
    return { ok: true, user };
  });

  writeChain = run.catch(() => undefined);
  return run;
}
