import { createClient } from '@libsql/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
  }

  try {
    const { url, authToken } = parseDatabaseUrl(databaseUrl);
    
    const client = createClient({
      url,
      authToken,
    });

    const result = await client.execute('SELECT 1 as test');
    
    return NextResponse.json({ 
      success: true, 
      result: result.rows,
      urlUsed: process.env.DATABASE_URL?.substring(0, 50) + '...'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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