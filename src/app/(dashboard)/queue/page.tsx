import { db } from '@/server/db';
import QueueLedger from '@/features/queue/QueueLedger';

export const dynamic = 'force-dynamic';

export default async function QueuePage() {
  const bookings = await db.getBookings();

  return (
    <QueueLedger bookings={bookings} />
  );
}

