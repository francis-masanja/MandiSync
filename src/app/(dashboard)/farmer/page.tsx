import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/options';
import { db } from '@/server/db';
import { FarmerPortal } from '@/features/farmer/FarmerPortal';

export const dynamic = 'force-dynamic';

export default async function FarmerPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/login');
  }

  const [mandis, allBookings] = await Promise.all([db.getMandis(), db.getBookings()]);
  const activeBookings = allBookings.filter((booking) => booking.farmerId === userId);

  return (
    <FarmerPortal
      mandis={mandis}
      activeBookings={activeBookings}
    />
  );
}
