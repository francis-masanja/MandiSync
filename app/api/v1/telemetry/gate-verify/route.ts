import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rfidTag = body.rfid_tag || body.token || body.rfidTag;
    const deviceId = body.device_id || 'ESP32-GATE-CONTROLLER';

    if (!rfidTag) {
      return NextResponse.json(
        { gate_open: false, error: 'Missing rfid_tag or token payload' },
        { status: 400 }
      );
    }

    const verification = db.verifyGateEntry(rfidTag, deviceId);

    return NextResponse.json({
      gate_open: verification.success,
      message: verification.message,
      booking: verification.booking,
      barrier_pulse_duration_ms: verification.success ? 15000 : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { gate_open: false, error: error?.message || 'Telemetry gate verification error' },
      { status: 500 }
    );
  }
}
