import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      booking_id,
      rfid_tag,
      weight_kg,
      measurement_type,
      moisture_percentage,
      device_id,
      source,
    } = body;

    if (weight_kg === undefined || !measurement_type) {
      return NextResponse.json(
        { error: 'weight_kg and measurement_type (GROSS or TARE) are required' },
        { status: 400 }
      );
    }

    const res = db.updateWeighbridgeMeasurement({
      bookingId: booking_id,
      rfidTag: rfid_tag,
      weightKg: Number(weight_kg),
      type: measurement_type === 'TARE' ? 'TARE' : 'GROSS',
      moisturePct: moisture_percentage ? Number(moisture_percentage) : undefined,
      deviceId: device_id || 'ESP32-SCALE-NODE-01',
      isOfflineBuffered: source === 'LITTLEFS_BUFFER',
    });

    if (!res.success) {
      return NextResponse.json(
        { error: 'Matching queue booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: res.booking,
      net_kg: res.netKg,
      message: `${measurement_type} weight of ${weight_kg}kg successfully recorded.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Weighbridge telemetry error' },
      { status: 500 }
    );
  }
}
