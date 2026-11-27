import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'mandisync',
    storage: process.env.DATABASE_URL ? 'database' : 'memory',
    time: new Date().toISOString(),
  });
}
