import { GateControlDesk } from '@/components/GateControlDesk';
import { db } from '@/lib/db';

export default async function GatePage() {
  const bookings = await db.getBookings();
  const logs = await db.getTelemetryLogs();

  return (
    <GateControlDesk bookings={bookings} logs={logs} />
  );
}

