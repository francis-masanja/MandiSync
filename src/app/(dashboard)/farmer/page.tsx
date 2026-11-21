import { db } from '@/server/db';
import { FarmerPortal } from '@/features/farmer/FarmerPortal';

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


