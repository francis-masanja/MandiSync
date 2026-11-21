import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { GateVerifySchema } from '@/shared/validation/telemetry';
import { getRequestRateLimit, getRateLimitHeaders } from '@/server/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await getRequestRateLimit(req);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { gate_open: false, error: 'Rate limit exceeded' },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const body = await req.json();
    const result = GateVerifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { gate_open: false, error: 'Invalid payload', details: result.error.flatten() },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { rfid_tag } = result.data;
    const verification = await db.verifyGateEntry(rfid_tag);

    return NextResponse.json({
      gate_open: verification.success,
      message: verification.message,
      booking: verification.booking,
      barrier_pulse_duration_ms: verification.success ? 15000 : 0,
      timestamp: new Date().toISOString(),
    }, { headers: getRateLimitHeaders(rateLimit) });
  } catch (error: any) {
    return NextResponse.json(
      { gate_open: false, error: error?.message || 'Telemetry gate verification error' },
      { status: 500 }
    );
  }
}