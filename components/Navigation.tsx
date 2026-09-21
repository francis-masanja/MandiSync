'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wheat,
  Radio,
  Scale,
  Layers,
  Cpu,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Home,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { href: '/farmer', label: 'Farmer Portal', icon: Wheat },
  { 
    href: '/gate', 
    label: 'Gate Control', 
    icon: Radio,
    children: [
      { href: '/gate/verify', label: 'Verify RFID' },
      { href: '/gate/logs', label: 'Gate Logs' },
      { href: '/gate/settings', label: 'Gate Settings' },
    ]
  },
  { 
    href: '/weigh', 
    label: 'Weighbridge', 
    icon: Scale,
    children: [
      { href: '/weigh/gross', label: 'Gross Weight' },
      { href: '/weigh/tare', label: 'Tare Weight' },
      { href: '/weigh/reports', label: 'Weight Reports' },
    ]
  },
  { 
    href: '/queue', 
    label: 'Queue Ledger', 
    icon: Layers,
    children: [
      { href: '/queue/active', label: 'Active Queue' },
      { href: '/queue/history', label: 'History' },
      { 
        href: '/queue/backlinks', 
        label: 'Backlinks',
        children: [
          { href: '/queue/backlinks/explore', label: 'Explore' },
          { href: '/queue/backlinks/monitor', label: 'Monitor' },
        ]
      },
    ]
  },
  { 
    href: '/firmware', 
    label: 'Firmware', 
    icon: Cpu,
    children: [
      { href: '/firmware/gate', label: 'Gate Node' },
      { href: '/firmware/scale', label: 'Scale Node' },
      { href: '/firmware/ota', label: 'OTA Updates' },
    ]
  },
];

const USER_MENU_ITEMS = [
  { label: 'Profile', icon: User, href: '/profile' },
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Help', icon: HelpCircle, href: '/help' },
  { label: 'Logout', icon: LogOut, action: 'logout' },
];

export function Navigation() {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleExpand = (href: string) => {
    setExpandedItems(prev => prev.includes(href) 
      ? prev.filter(h => h !== href) 
      : [...prev, href]
    );
  };
  const isExpanded = (href: string) => expandedItems.includes(href);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-out
          bg-[#2b3643] border-r border-[#394a5a]
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
        `}
        aria-label="Main navigation"
        style={{ backgroundColor: '#2b3643', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#394a5a]">
          {!sidebarCollapsed && (
            <Link href="/farmer" className="flex items-center gap-2">
              <Wheat className="w-7 h-7 text-[#00d2a0]" />
              <span className="font-bold text-white">MandiSync</span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-[#354454] text-[#9cb0c3] transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-2 space-y-1" aria-label="Main menu">
          {NAV_ITEMS.map(({ href, label, icon: Icon, children, badge }) => {
            const isActive = pathname === href || (href !== '/farmer' && pathname.startsWith(href));
            const hasChildren = children && children.length > 0;
            const expanded = hasChildren && isExpanded(href);

            return (
              <div key={href} className="group">
                <Link
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-[2px] transition-all duration-150
                    ${sidebarCollapsed ? 'justify-center' : 'justify-start'}
                    ${isActive
                      ? 'bg-[#232c37] text-white border-l-3 border-[#00d2a0]'
                      : 'text-[#9bb0c1] hover:bg-[#354454] hover:text-white'}
                    ${sidebarCollapsed ? 'justify-center px-3' : ''}
                  `}
                  title={sidebarCollapsed ? label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {Icon && (
                    <span className={`
                      w-5 h-5 flex-shrink-0 transition-all duration-150
                      ${isActive ? 'text-[#00d2a0]' : 'text-[#9bb0c1] group-hover:text-white'}
                    `} aria-hidden="true">
                      <Icon className="w-5 h-5" />
                    </span>
                  )}
                  {!sidebarCollapsed && (
                    <span className="font-medium truncate text-sm">{label}</span>
                  )}
                  {badge && !sidebarCollapsed && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-[#00d2a0]/20 text-[#00d2a0] rounded-full">
                      {badge}
                    </span>
                  )}
                  {hasChildren && !sidebarCollapsed && (
                    <ChevronRight
                      className={`
                        ml-auto w-4 h-4 text-[#6c7f93] transition-transform duration-150
                        ${expanded ? 'rotate-90 text-[#00d2a0]' : 'text-[#6c7f93]'}
                      `}
                      aria-hidden="true"
                    />
                  )}
                </Link>

                {/* Sub-menu */}
                {hasChildren && !sidebarCollapsed && expanded && (
                  <ul className="sub-menu" style={{ backgroundColor: '#232c37', padding: '6px 0 10px 42px' }}>
                    {children.map((child, index) => {
                      const childActive = pathname === child.href || (child.href && pathname.startsWith(child.href));
                      const childExpanded = child.children && isExpanded(child.href);
                      
                      return (
                        <li key={child.href || `child-${index}`} className={`sub-item relative ${childActive ? 'active' : ''}`} style={{ position: 'relative' }}>
                          <Link
                            href={child.href}
                            className="sub-link block px-2 py-2 text-sm transition-colors flex items-center justify-between"
                            style={{ 
                              color: childActive ? '#ffffff' : '#6c7f93',
                              fontWeight: childActive ? 600 : 400,
                              fontSize: '12px'
                            }}
                            aria-current={childActive ? 'page' : undefined}
                          >
                            {child.label}
                            {child.children && child.children.length > 0 && (
<ChevronRight className="inline-block w-3 h-3 ml-auto transition-transform duration-150" 
  style={{ transform: childExpanded ? 'rotate(90deg)' : 'rotate(0)' }}
/>
                            )}
                          </Link>

                          {/* Nested sub-menu (2nd level) */}
                          {child.children && child.children.length > 0 && childExpanded && (
                            <ul className="nested-menu" style={{ paddingLeft: '16px', margin: '4px 0', position: 'relative' }}>
                              {child.children.map((nested, nIndex) => (
                                <li key={nested.href || `nested-${nIndex}`} className="nested-item relative">
                                  <Link
                                    href={nested.href}
                                    className="nested-link block py-1 text-xs transition-colors"
                                    style={{ color: '#6c7f93', fontSize: '11px' }}
                                  >
                                    {nested.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#394a5a]">
          {!sidebarCollapsed && (
            <div className="text-xs text-[#64748b] text-center">
              v2.4.0 · Smart APMC Queue
            </div>
          )}
        </div>
      </aside>

      {/* Top Header */}
      <header
        className={`
          sticky top-0 z-30 h-16 bg-[#1e2631]/80 backdrop-blur-xl border-b border-[#394a5a]
          ${scrolled ? 'shadow-[0_10px_25px_rgba(0,0,0,0.3)]' : ''}
          transition-shadow duration-200
        `}
        style={{ backgroundColor: 'rgba(30, 38, 49, 0.8)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left: Logo + Desktop nav tabs */}
            <div className="flex items-center gap-4">
              <Link
                href="/farmer"
                className={`
                  flex items-center gap-2
                  ${sidebarCollapsed ? 'hidden lg:flex' : 'flex'}
                `}
              >
                <Wheat className="w-7 h-7 text-[#00d2a0]" />
                <span className="font-bold text-white hidden sm:block">MandiSync</span>
              </Link>

              {/* Desktop nav tabs (hidden on mobile) */}
              <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
                {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
                  const isActive = pathname === href || (href !== '/farmer' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-[2px] text-sm font-medium transition-all duration-150
                        ${isActive
                          ? 'bg-[#232c37] text-white border-l-3 border-l-[#00d2a0] pl-[calc(3px+12px)]'
                          : 'text-[#9bb0c1] hover:bg-[#354454] hover:text-white'}
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {Icon && <Icon className={isActive ? 'text-[#00d2a0]' : 'text-[#9bb0c1]'} aria-hidden="true" />}
                      {label}
                      {badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#00d2a0]/20 text-[#00d2a0] rounded-full">
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Search + Notifications + User Menu */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search bookings, farmers..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-[#232c37] border border-[#394a5a] rounded-[2px] text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#00d2a0]/50 focus:border-[#00d2a0]/50 transition-all"
                  aria-label="Search"
                  style={{ backgroundColor: '#232c37', borderColor: '#394a5a', color: 'white' }}
                />
              </div>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-[2px] hover:bg-[#354454] text-[#9cb0c3] transition-colors"
                aria-label="Notifications (2 unread)"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#00d2a0] text-[#1e2631] text-[10px] font-bold rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-[2px] hover:bg-[#354454] transition-colors"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-[#00d2a0]/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#00d2a0]" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-white">Admin</span>
                  <ChevronDown className="w-4 h-4 text-[#64748b] hidden md:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-[#2b3643] border border-[#394a5a] rounded-[2px] shadow-[0_10px_25px_rgba(0,0,0,0.3)] py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                      {USER_MENU_ITEMS.map(({ label, icon: Icon, href, action }) => (
                        <button
                          key={label}
                          onClick={() => {
                            if (action === 'logout') {
                              console.log('Logout clicked');
                            }
                            setUserMenuOpen(false);
                          }}
                          className={`
                            flex items-center gap-2 w-full px-3 py-2 text-sm text-[#9cb0c3]
                            hover:bg-[#354454] hover:text-white rounded-none first:rounded-t-[2px] last:rounded-b-[2px] transition-colors
                          `}
                        >
                          <Icon className="w-4 h-4 text-[#6c7f93]" aria-hidden="true" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}