import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { Role, hasPermission } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Authentication & permission – only farmers can create bookings
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const allowed = hasPermission(token.role as Role, 'createBooking');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // The farmer's ID is stored in token.sub – link booking to this user
  const farmerId = token.sub as string;

  try {
    const body = await req.json();
    const {
      farmerName,
      farmerPhone,
      farmerVillage,
      farmerLat,
      farmerLon,
      mandiId,
      slotId,
      cropType,
      cropVariety,
      estimatedKg,
      vehicleNumber,
      rfidTag,
    } = body;

    // Validate required fields
    const requiredFields = [
      { key: 'farmerName', value: farmerName },
      { key: 'farmerPhone', value: farmerPhone },
      { key: 'farmerVillage', value: farmerVillage },
      { key: 'farmerLat', value: farmerLat },
      { key: 'farmerLon', value: farmerLon },
      { key: 'mandiId', value: mandiId },
      { key: 'vehicleNumber', value: vehicleNumber },
      { key: 'rfidTag', value: rfidTag },
    ];

    const missing = requiredFields
      .filter(({ value }) => value === undefined || value === null || value === '')
      .map(({ key }) => key);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate lat/lon are valid numbers within valid ranges
    const lat = Number(farmerLat);
    const lon = Number(farmerLon);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return NextResponse.json({ error: 'Invalid farmerLat: must be a number between -90 and 90' }, { status: 400 });
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      return NextResponse.json({ error: 'Invalid farmerLon: must be a number between -180 and 180' }, { status: 400 });
    }

    const booking = db.createBooking({
      farmerName,
      farmerPhone: farmerPhone.trim(),
      farmerVillage: farmerVillage.trim(),
      farmerLat: lat,
      farmerLon: lon,
      mandiId,
      slotId: slotId || 'slot-01',
      cropType: cropType || 'Wheat',
      cropVariety: cropVariety || 'Grade A',
      estimatedKg: Number(estimatedKg || 2500),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      rfidTag: rfidTag.trim().toUpperCase(),
      farmerId,
    });

    return NextResponse.json({
      success: true,
      booking,
      message: 'Slot booked successfully. Digital Gate Pass and RFID tag registered.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}