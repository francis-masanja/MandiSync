import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { NextResponse } from 'next/server';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
  }

  try {
    const { url, authToken } = parseDatabaseUrl(databaseUrl);
    
    const libsql = createClient({
      url,
      authToken,
    });

    const adapter = new PrismaLibSql({
      url,
      authToken,
    });
    const prisma = new PrismaClient({ adapter });

    const bookings = await prisma.booking.findMany({ 
      orderBy: { createdAt: 'desc' },
      take: 5 
    });

    await prisma.$disconnect();

    return NextResponse.json({ 
      success: true, 
      bookings: bookings.length,
      firstBooking: bookings[0] || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

function parseDatabaseUrl(url: string): { url: string; authToken?: string } {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has('authToken')) {
      return {
        url: `${parsed.protocol}//${parsed.host}`,
        authToken: parsed.searchParams.get('authToken') || undefined,
      };
    }
  } catch {
    // If URL parsing fails, return as-is
  }
  return { url };
}