import type { Metadata } from 'next';
import { SettingsPanel } from '@/features/system/SettingsPanel';

export const metadata: Metadata = {
  title: 'Settings & Logs — MandiSync',
  description: 'Account, clay theme, and runtime diagnostics.',
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
