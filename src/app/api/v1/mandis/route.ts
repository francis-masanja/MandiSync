import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { MandisQuerySchema } from '@/shared/validation/telemetry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const result = MandisQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { farmer_lat, farmer_lon, limit, offset } = result.data;

    const mandis = await db.getMandisWithDistance(farmer_lat, farmer_lon);
    const mandisWithSlots = await Promise.all(
      mandis.slice(offset, offset + limit).map(async (m) => ({
        ...m,
        slots: await db.getSlotsForMandi(m.id),
      }))
    );

    return NextResponse.json({
      mandis: mandisWithSlots,
      pagination: { limit, offset, total: mandis.length },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch mandis' }, { status: 500 });
  }
}