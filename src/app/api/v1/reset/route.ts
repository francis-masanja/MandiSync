import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/server/db';
import { Role, hasPermission } from '@/server/auth/roles';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Defense in depth: enforce admin authorization inside the handler too.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }
  if (!hasPermission(token.role as Role, 'resetDemo')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.resetDemoData?.();
  return NextResponse.json({ success: true, message: 'Database reset to initial demo seeds' });
}
