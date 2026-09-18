import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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

    if (!farmerName || !mandiId || !vehicleNumber || !rfidTag) {
      return NextResponse.json(
        { error: 'Missing required booking details (farmerName, mandiId, vehicleNumber, rfidTag)' },
        { status: 400 }
      );
    }

    const booking = db.createBooking({
      farmerName,
      farmerPhone: farmerPhone || '+91 98000 00000',
      farmerVillage: farmerVillage || 'Rural Farm Sector',
      farmerLat: Number(farmerLat || 29.6857),
      farmerLon: Number(farmerLon || 76.9905),
      mandiId,
      slotId: slotId || 'slot-01',
      cropType: cropType || 'Wheat',
      cropVariety: cropVariety || 'Grade A',
      estimatedKg: Number(estimatedKg || 2500),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      rfidTag: rfidTag.trim().toUpperCase(),
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
