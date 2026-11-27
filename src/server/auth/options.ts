import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import { findUserByEmail } from '@/server/auth/users';
import { Role } from '@/server/auth/roles';

// Vercel exposes the deployment URL as VERCEL_URL. NextAuth still wants a
// canonical NEXTAUTH_URL; use the deployment URL when the project has not set
// an explicit custom domain.
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Authentication timeout')), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;
        const { email, password } = credentials;
        const user = await findUserByEmail(email);
        if (!user) return null;
        const isValid = await withTimeout(bcrypt.compare(password, user.passwordHash), 10000);
        if (!isValid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  // Use NextAuth's cookie defaults. On HTTPS NextAuth prefixes the session
  // cookie with `__Secure-`; getToken() (proxy and API handlers) expects that
  // prefixed name on Vercel. A custom unprefixed cookie name makes login work
  // while every protected page and API call redirects as unauthenticated.
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
