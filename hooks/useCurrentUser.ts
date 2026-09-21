import { useSession } from 'next-auth/react';
import type { Role } from '@/lib/roles';

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
} | null;

export const useCurrentUser = (): CurrentUser => {
  const { data: session } = useSession();
  return session?.user as any;
};
