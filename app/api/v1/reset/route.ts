import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  db.resetDemoData?.();
  return NextResponse.json({ success: true, message: 'Database reset to initial demo seeds' });
}
