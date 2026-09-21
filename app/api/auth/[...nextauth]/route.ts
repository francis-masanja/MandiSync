import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUserByEmail } from '@/lib/users';
import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import { Role } from '@/lib/roles';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Timeout helper – aborts the credential check after the specified ms.
 */
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

/**
 * Check if we're in production environment
 */
const isProduction = process.env.NODE_ENV === 'production';

const authOptions: NextAuthOptions = {
  // 10‑second timeout for credential verification
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
        // Find user
        const user = findUserByEmail(email);
        if (!user) return null;
        // Verify password with timeout protection
        const isValid = await withTimeout(bcrypt.compare(password, user.passwordHash), 10000);
        if (!isValid) return null;
        // Return user payload – NextAuth will create a JWT containing these fields
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
    // default is JWT; we keep that and expose role in the session token
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days (can be overridden per signIn)
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        path: '/',
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        path: '/',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      // First sign‑in – copy role into token
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub; // sub is the user.id
      }
      return session;
    },
  },
  // CSRF protection is automatically added by NextAuth for POST routes
  pages: {
    signIn: '/login', // custom sign‑in page
    error: '/login', // redirect errors back to login page
  },
};

const nextAuth = NextAuth(authOptions);

/**
 * Rate limiting configuration for auth routes
 * 5 requests per minute per IP
 */
const AUTH_RATE_LIMIT = {
  max: 5,
  windowMs: 60_000, // 1 minute
  keyPrefix: 'auth',
};

/**
 * Simple in-memory rate limiter for auth
 */
const authLimiterStore = new Map<string, { count: number; resetTime: number }>();

function authRateLimit(ip: string): { success: boolean; limit: number; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = authLimiterStore.get(ip);
  const limit = 5;
  const windowMs = 60_000;

  if (!entry || now > entry.resetTime) {
    authLimiterStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, limit, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, resetAt: entry.resetTime };
  }

  entry.count++;
  return { success: true, limit, remaining: limit - entry.count, resetAt: entry.resetTime };
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

/**
 * Wrapper to apply rate limiting before NextAuth handlers
 */
async function withRateLimit(
  request: Request,
  handler: (req: Request) => Promise<NextResponse>
): Promise<NextResponse> {
  const ip = getClientIp(request);
  const result = authRateLimit(ip);

  // Add rate limit headers
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());

  if (!result.success) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers),
          'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const response = await handler(request);
  // Add rate limit headers to successful responses
  headers.forEach((value, key) => {
    if (key !== 'success') {
      response.headers.set(`X-RateLimit-${key.charAt(0).toUpperCase() + key.slice(1)}`, value.toString());
    }
  });

  return response;
}

export const GET = async (request: Request) => {
  return withRateLimit(request, (req) => nextAuth.handlers.GET(req));
};

export const POST = async (request: Request) => {
  return withRateLimit(request, (req) => nextAuth.handlers.POST(req));
};