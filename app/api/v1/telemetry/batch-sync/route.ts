import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const packets = body.packets || body.buffer || [];

    if (!Array.isArray(packets) || packets.length === 0) {
      return NextResponse.json(
        { error: 'Expected non-empty array of LittleFS buffered packets' },
        { status: 400 }
      );
    }

    const syncResult = db.syncLittleFsBatch(packets);

    return NextResponse.json({
      success: true,
      message: `Successfully flushed ${syncResult.synced_count} offline LittleFS records into central ledger`,
      synced_count: syncResult.synced_count,
      server_timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Batch sync failure' }, { status: 500 });
  }
}
