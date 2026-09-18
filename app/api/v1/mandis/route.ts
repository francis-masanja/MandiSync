import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : undefined;

    const mandis = db.getMandis(lat, lon);
    const mandisWithSlots = mandis.map((m) => ({
      ...m,
      slots: db.getSlotsForMandi(m.id),
    }));

    return NextResponse.json({
      mandis: mandisWithSlots,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch mandis' }, { status: 500 });
  }
}
