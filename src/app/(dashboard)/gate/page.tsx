import { GateControlDesk } from '@/features/gate/GateControlDesk';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

export default async function GatePage() {
  const bookings = await db.getBookings();
  const logs = await db.getTelemetryLogs();

  return (
    <GateControlDesk bookings={bookings} logs={logs} />
  );
}

