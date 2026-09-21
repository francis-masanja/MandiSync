import { createClient } from '@libsql/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
    }

    const { url, authToken } = parseDatabaseUrl(databaseUrl);
    
    const client = createClient({
      url,
      authToken,
    });

    // Check tables
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    
    // Check bookings table
    const bookings = await client.execute('SELECT * FROM bookings LIMIT 5');
    
    return NextResponse.json({ 
      success: true, 
      tables: tables.rows,
      bookings: bookings.rows
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