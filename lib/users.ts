import fs from 'fs';
import path from 'path';

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'farmer' | 'operator' | 'admin';
};

/** Absolute path to the JSON file that stores demo users. */
const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

/** Load and parse the users JSON file. Returns an empty array if the file does not exist. */
export const loadUsers = (): User[] => {
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

/** Find a user by email (case‑insensitive). */
export const findUserByEmail = (email: string): User | undefined => {
  const lower = email.toLowerCase();
  return loadUsers().find((u) => u.email.toLowerCase() === lower);
};

/** Find a user by its id. */
export const findUserById = (id: string): User | undefined => {
  return loadUsers().find((u) => u.id === id);
};
