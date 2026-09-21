import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role, hasPermission } from '@/lib/roles';

/**
 * Mapping of path prefixes to the minimal role(s) required.
 * The middleware will redirect to /unauthorized when the user lacks the role.
 */
const pathRoleMap: Record<string, Role[]> = {
  '/farmer': [Role.Farmer],
  '/dashboard': [Role.Operator, Role.Admin],
  '/admin': [Role.Admin],
  // API prefixes – additional per‑handler checks will be applied inside the route files
  '/api/v1/queue': [Role.Operator, Role.Admin],
  '/api/v1/telemetry': [Role.Farmer, Role.Operator, Role.Admin],
  '/api/v1/reset': [Role.Admin],
  '/api/v1/admin': [Role.Admin],
};

/**
 * Content Security Policy headers
 * Strict policy to prevent XSS and token leakage
 */
const CSP_HEADERS = {
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

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(CSP_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Check if we're in production environment
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Allow NextAuth routes and static assets without a token.
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/auth/') || pathname.startsWith('/favicon.ico')) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // No token – force login.
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    return addSecurityHeaders(response);
  }

  const role = token.role as Role;

  // Find the first matching prefix.
  const match = Object.entries(pathRoleMap).find(([prefix]) => pathname.startsWith(prefix));
  if (match) {
    const [, allowedRoles] = match;
    if (!allowedRoles.includes(role)) {
      const response = NextResponse.redirect(new URL('/unauthorized', request.url));
      return addSecurityHeaders(response);
    }
  }

  // All checks passed – continue with security headers.
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  // Apply to every request (the function will early‑return for public paths).
  matcher: '/:path*',
};