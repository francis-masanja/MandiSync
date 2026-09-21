import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mandiId = searchParams.get('mandiId');

    let bookings = await db.getBookings();
    if (mandiId) {
      bookings = bookings.filter((b) => b.mandiId === mandiId);
    }

    const logs = await db.getTelemetryLogs(40);
    const mandis = await db.getMandis();

    const totalQueued = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const gateVerified = bookings.filter((b) => b.status === 'GATE_VERIFIED').length;
    const activeWeighing = bookings.filter((b) => b.status === 'WEIGHED_GROSS').length;
    const completedToday = bookings.filter((b) => b.status === 'COMPLETED').length;
    const totalProcuredKg = bookings
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.actualNetKg || 0), 0);

    return NextResponse.json({
      bookings,
      logs,
      mandis,
      metrics: {
        total_queued: totalQueued,
        gate_verified: gateVerified,
        active_weighing: activeWeighing,
        completed_today: completedToday,
        total_procured_kg: totalProcuredKg,
        target_avg_wait_minutes: 35,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch queue status' },
      { status: 500 }
    );
  }
}
