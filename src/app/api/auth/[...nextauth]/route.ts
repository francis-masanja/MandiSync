import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUserByEmail } from '@/server/auth/users';
import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import { Role } from '@/server/auth/roles';
import { NextRequest, NextResponse } from 'next/server';
import { InMemoryRateLimiter, getRateLimitHeaders } from '@/server/rate-limit';

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
        const user = await findUserByEmail(email);
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

type NextAuthRouteContext = { params: Promise<{ nextauth: string[] }> };

/**
 * Rate limiting configuration for auth routes
 * 5 requests per minute per IP
 */
const AUTH_RATE_LIMIT = {
  max: 5,
  windowMs: 60_000,
  keyPrefix: 'auth',
};

const authLimiter = new InMemoryRateLimiter({
  limit: AUTH_RATE_LIMIT.max,
  windowMs: AUTH_RATE_LIMIT.windowMs,
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

/**
 * Wrapper to apply rate limiting before NextAuth handlers.
 */
async function withRateLimit(
  request: Request,
  handler: () => Promise<Response>
): Promise<Response> {
  const result = await authLimiter.limit(`${AUTH_RATE_LIMIT.keyPrefix}:${getClientIp(request)}`);
  const rateLimitHeaders = getRateLimitHeaders(result);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          'Retry-After': Math.max(0, Math.ceil((result.reset - Date.now()) / 1000)).toString(),
        },
      }
    );
  }

  const response = await handler();
  for (const [key, value] of Object.entries(rateLimitHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export async function GET(request: NextRequest, context: NextAuthRouteContext) {
  // Session, CSRF, provider and callback lookups are read-only and are fetched
  // frequently by the client. Rate limiting them locks the UI out of its own
  // session, so only credential submissions are throttled.
  return nextAuth(request, context);
}

export async function POST(request: NextRequest, context: NextAuthRouteContext) {
  const { nextauth } = await context.params;
  const route = (nextauth ?? []).join('/');
  const isCredentialSubmission = route === 'callback/credentials';

  if (!isCredentialSubmission) {
    return nextAuth(request, context);
  }

  return withRateLimit(request, () => nextAuth(request, context));
}
