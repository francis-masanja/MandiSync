import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser } from '@/server/auth/users';
import { SignupSchema } from '@/shared/validation/auth';
import { InMemoryRateLimiter, getRateLimitHeaders } from '@/server/rate-limit';

export const dynamic = 'force-dynamic';

const signupLimiter = new InMemoryRateLimiter({ limit: 5, windowMs: 60_000 });

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(request: NextRequest) {
  const rate = await signupLimiter.limit(`signup:${clientIp(request)}`);
  if (!rate.success) {
    return NextResponse.json(
      { error: 'Too many sign-up attempts. Try again in a minute.' },
      {
        status: 429,
        headers: {
          ...getRateLimitHeaders(rate),
          'Retry-After': Math.max(0, Math.ceil((rate.reset - Date.now()) / 1000)).toString(),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Send a JSON body.' }, { status: 400 });
  }

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Check the form fields.', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);
  const created = await createUser({ name, email, passwordHash });

  if (!created.ok) {
    if (created.reason === 'readonly') {
      return NextResponse.json(
        {
          error:
            'Sign-up is disabled on this deployment. Use one of the demo accounts, or configure a database.',
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'An account with this email already exists.' },
      { status: 409 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      user: {
        id: created.user.id,
        name: created.user.name,
        email: created.user.email,
        role: created.user.role,
      },
    },
    { status: 201 }
  );
}
