import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    databaseUrl: process.env.DATABASE_URL ? 'SET' : 'UNDEFINED',
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    nodeEnv: process.env.NODE_ENV,
  });
}