import { db } from '@/lib/db';
import QueueLedger from '@/components/QueueLedger';

export default async function QueuePage() {
  const bookings = await db.getBookings();

  return (
    <QueueLedger bookings={bookings} />
  );
}

