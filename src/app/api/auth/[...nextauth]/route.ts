import NextAuth from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/server/auth/options';
import { InMemoryRateLimiter, getRateLimitHeaders } from '@/server/rate-limit';

const nextAuth = NextAuth(authOptions);

type NextAuthRouteContext = { params: Promise<{ nextauth: string[] }> };

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
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

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
