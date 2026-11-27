import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role } from '@/server/auth/roles';

/**
 * Paths that do not require an authenticated session.
 * Exact match for "/" plus prefix matches for the rest.
 */
const PUBLIC_PATHS = new Set(['/']);
const PUBLIC_PREFIXES = [
  '/_next',
  '/api/auth',
  '/api/health',
  '/favicon.ico',
  '/login',
  '/signup',
  '/forgot-password',
  '/unauthorized',
];

/**
 * Mapping of path prefixes to the minimal role(s) required.
 * The proxy redirects to /unauthorized when the user lacks the role.
 */
const pathRoleMap: Record<string, Role[]> = {
  '/admin': [Role.Admin],
  '/farmer': [Role.Farmer],
  '/gate': [Role.Operator, Role.Admin],
  '/queue': [Role.Operator, Role.Admin],
  '/api/v1/bookings': [Role.Farmer],
  '/api/v1/mandis': [Role.Farmer, Role.Operator, Role.Admin],
  '/api/v1/queue': [Role.Operator, Role.Admin],
  '/api/v1/telemetry': [Role.Farmer, Role.Operator, Role.Admin],
  '/api/v1/reset': [Role.Admin],
};

/**
 * Content Security Policy headers
 * Strict policy to prevent XSS and token leakage.
 */
const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval for dev
    "style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' http://localhost:11434", // Ollama API
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return true;
  // Static files (e.g. /robots.txt, /icon.svg)
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  let token: Awaited<ReturnType<typeof getToken>> = null;
  try {
    token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  } catch {
    // Treat a token-decoding failure as unauthenticated rather than returning a 500.
    token = null;
  }

  if (!token) {
    // Never redirect API calls to an HTML login page.
    if (isApiPath(pathname)) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  const role = token.role as Role;
  const match = Object.entries(pathRoleMap).find(([prefix]) => pathname.startsWith(prefix));

  if (match) {
    const [, allowedRoles] = match;
    if (!allowedRoles.includes(role)) {
      if (isApiPath(pathname)) {
        return addSecurityHeaders(
          NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        );
      }
      return addSecurityHeaders(NextResponse.redirect(new URL('/unauthorized', request.url)));
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: '/:path*',
};
