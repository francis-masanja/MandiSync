import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BatchSyncSchema } from '@/lib/validation/telemetry';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const deviceId = req.headers.get('x-device-id') || undefined;
    const rateLimit = await checkRateLimit(ip, deviceId);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const body = await req.json();
    const result = BatchSyncSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: result.error.flatten() },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { packets } = result.data;
    const syncResult = db.syncLittleFsBatch?.(packets);

    return NextResponse.json({
      success: true,
      message: `Successfully flushed ${syncResult.syncedCount} offline LittleFS records into central ledger`,
      syncedCount: syncResult.syncedCount,
      serverTimestamp: new Date().toISOString(),
    }, { headers: getRateLimitHeaders(rateLimit) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Batch sync failure' }, { status: 500 });
  }
}