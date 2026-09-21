import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role, hasPermission } from '@/lib/roles';
import { db } from '@/lib/db';
import { WeighbridgeSchema } from '@/lib/validation/telemetry';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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

  // Authentication & permission check
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  // Only farmers and operators may submit telemetry
  const allowed = hasPermission(token.role as Role, 'submitTelemetry');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // If a farmer, ensure they own the booking they are updating
  if (token.role === Role.Farmer) {
    const bodyPreview = await req.clone().json();
    const booking = await db.getBookingById(bodyPreview.booking_id);
    if (!booking || booking.farmerId !== token.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    const body = await req.json();
    const result = WeighbridgeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: result.error.flatten() },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const {
      booking_id,
      rfid_tag,
      weight_kg,
      measurement_type,
      moisture_percentage,
      device_id,
      source,
    } = result.data;

    const res = await db.updateWeighbridgeMeasurement({
      bookingId: booking_id,
      rfidTag: rfid_tag,
      weightKg: weight_kg,
      type: measurement_type,
      moisturePct: moisture_percentage,
      deviceId: device_id || 'ESP32-SCALE-NODE-01',
      isOfflineBuffered: source === 'LITTLEFS_BUFFER',
    });

    if (!res.success) {
      return NextResponse.json(
        { error: 'Matching queue booking not found' },
        { status: 404, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    return NextResponse.json({
      success: true,
      booking: res.booking,
      netKg: res.netKg,
      message: `${measurement_type} weight of ${weight_kg}kg successfully recorded.`,
      timestamp: new Date().toISOString(),
    }, { headers: getRateLimitHeaders(rateLimit) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Weighbridge telemetry error' },
      { status: 500 }
    );
  }
}