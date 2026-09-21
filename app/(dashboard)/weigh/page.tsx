import { db } from '@/lib/db';
import { HardwareBench } from '@/components/HardwareBench';

export default async function WeighPage() {
  const bookings = await db.getBookings();
  const logs = await db.getTelemetryLogs();

  return (
    <HardwareBench bookings={bookings} logs={logs} />
  );
}

