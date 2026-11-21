'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronRight, Home, Layers, LayoutDashboard, Radio, Settings, Wheat } from 'lucide-react';
import { roleHome } from '@/shared/roles';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const ROUTE_CONFIG: Record<string, BreadcrumbItem> = {
  '/admin': { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  '/farmer': { label: 'My Deliveries', href: '/farmer', icon: Wheat },
  '/gate': { label: 'Gate Desk', href: '/gate', icon: Radio },
  '/queue': { label: 'Queue Ledger', href: '/queue', icon: Layers },
  '/settings': { label: 'Settings & Logs', href: '/settings', icon: Settings },
};

function getBreadcrumbs(pathname: string, home: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: home, icon: Home }];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const config = ROUTE_CONFIG[currentPath];
    if (config) {
      breadcrumbs.push(config);
    } else {
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
      });
    }
  }

  return breadcrumbs;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const breadcrumbs = getBreadcrumbs(pathname, roleHome(role));

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;
          const uniqueKey = `${index}-${item.href || item.label}`;

          return (
            <li key={uniqueKey} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--clay-faint)]" aria-hidden="true" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[var(--clay-muted)] transition-colors hover:bg-[var(--clay-surface-2)] hover:text-[var(--clay-text)]"
                >
                  {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-semibold text-[var(--clay-text)]"
                  aria-current="page"
                >
                  {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
