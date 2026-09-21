'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Wheat, Radio, Scale, Layers, Cpu } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const ROUTE_CONFIG: Record<string, BreadcrumbItem> = {
  '/farmer': { label: 'Farmer Portal', href: '/farmer', icon: Wheat },
  '/gate': { label: 'Gate Control', href: '/gate', icon: Radio },
  '/weigh': { label: 'Weighbridge', href: '/weigh', icon: Scale },
  '/queue': { label: 'Queue Ledger', href: '/queue', icon: Layers },
  '/firmware': { label: 'Firmware', href: '/firmware', icon: Cpu },
  '/profile': { label: 'Profile', href: '/profile', icon: Home },
  '/settings': { label: 'Settings', href: '/settings', icon: Home },
  '/help': { label: 'Help', href: '/help', icon: Home },
};

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/farmer', icon: Home },
  ];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const config = ROUTE_CONFIG[currentPath];
    if (config) {
      breadcrumbs.push(config);
    } else {
      // Dynamic route - capitalize segment
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
  const breadcrumbs = getBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      className="mb-6"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2 text-sm font-medium">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;
          const uniqueKey = `${index}-${item.href || item.label}`;

          return (
            <li key={uniqueKey} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-slate-400 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                    text-slate-500 hover:text-slate-700 hover:bg-white/50
                    transition-colors font-medium
                  `}
                >
                  {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                    text-slate-900 font-semibold
                  `}
                  aria-current="page"
                >
                  {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
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