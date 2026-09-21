import { db } from '@/lib/db';
import { FarmerPortal } from '@/components/FarmerPortal';

export default async function FarmerPage() {
  const mandis = await db.getMandis();
  const bookings = await db.getBookings();

  return (
    <FarmerPortal
      mandis={mandis}
      activeBookings={bookings}
    />
  );
}


