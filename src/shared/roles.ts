export type UserRole = 'farmer' | 'operator' | 'admin';

export const ROLE_LABELS: Record<UserRole, string> = {
  farmer: 'Farmer',
  operator: 'Gate Operator',
  admin: 'Administrator',
};

export const ROLE_SUMMARIES: Record<UserRole, string> = {
  farmer: 'Book slots, carry your QR pass, and track delivery status.',
  operator: 'Verify arrivals, capture weights, and keep the queue moving.',
  admin: 'Oversee every mandi, reconcile the ledger, and inspect diagnostics.',
};

export function isUserRole(value: unknown): value is UserRole {
  return value === 'farmer' || value === 'operator' || value === 'admin';
}

export function roleHome(role?: string | null): string {
  if (role === 'admin') return '/admin';
  if (role === 'operator') return '/gate';
  return '/farmer';
}

export function roleLabel(role?: string | null): string {
  return isUserRole(role) ? ROLE_LABELS[role] : 'Member';
}
