'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const SIDEBAR_NAV = [
  {
    section: 'DASHBOARD',
    items: [
      { name: 'Overview', href: '/dashboard', icon: 'fi fi-rr-apps' },
      { name: 'All Activity', href: '/dashboard/activity', icon: 'fi fi-rr-time-past' },
      { name: 'My Inbox', href: '/dashboard/inbox', icon: 'fi fi-rr-envelope' },
    ],
  },
  {
    section: 'WALLET',
    items: [
      { name: 'My Balance', href: '/dashboard/balance', icon: 'fi fi-rr-wallet' },
      { name: 'Swap Token', href: '/dashboard/swap', icon: 'fi fi-rr-shuffle' },
    ],
  },
  {
    section: 'COMMUNITY',
    items: [
      { name: 'Explore Rooms', href: '/dashboard/rooms', icon: 'fi fi-rr-grid' },
      { name: 'Create Room', href: '/dashboard/create-room', icon: 'fi fi-rr-add-document' },
    ],
  },
  {
    section: 'ACCOUNT',
    items: [
      { name: 'My Profile', href: '/dashboard/profile', icon: 'fi fi-rr-user' },
      { name: 'Help Center', href: '/dashboard/help', icon: 'fi fi-rr-info' },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 bottom-0 w-[280px] border-r border-neutral-5 bg-background flex flex-col z-40 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo and Mobile Close */}
      <div className="h-20 flex items-center justify-between px-8">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://placehold.co/120x40/transparent/000000?text=BagiTHR" alt="BagiTHR Logo" className="h-8 object-contain" />
        </Link>
        <button 
          onClick={onClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center text-neutral-7 hover:text-black transition-colors rounded-md hover:bg-neutral-5"
        >
          <i className="fi fi-rr-cross text-sm" />
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-8 py-2 space-y-6 sidebar-scrollbar">
        {SIDEBAR_NAV.map((group, i) => (
          <div key={i} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-neutral-7 uppercase tracking-wider">
              {group.section}
            </h3>
            <div className="flex flex-col gap-1 mt-1">
              {group.items.map((item, j) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={j}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-[15px] font-medium transition-colors",
                      isActive
                        ? "bg-[#16a34a] text-white"
                        : "text-black hover:bg-neutral-100"
                    )}
                  >
                    <i className={cn(item.icon, "text-[18px] flex-shrink-0 w-5 text-center mt-[1px]")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            {/* Minimal separator if needed, based on design there's a subtle line between sections */}
            {i < SIDEBAR_NAV.length - 1 && (
              <div className="h-px bg-neutral-5 mt-4" />
            )}
          </div>
        ))}
      </div>

      {/* Bottom Invite Card Placeholder */}
      <div className="px-8 pb-8">
        <div className="bg-emerald-50 rounded-md p-4 border border-neutral-5 flex flex-col gap-3 relative overflow-hidden">
          <p className="text-sm font-semibold text-emerald-900 leading-tight z-10 w-2/3">
            Bring your friends into everyday celebrations
          </p>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 px-3 rounded-md w-fit flex items-center gap-2 z-10 transition-colors">
            Invite <i className="fi fi-rr-users-add" />
          </button>

          {/* Illustration placeholder */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://placehold.co/100x100/transparent/22c55e?text=Gift"
            alt="Gift Illustration"
            className="absolute -right-4 -bottom-4 w-24 h-24 object-contain opacity-80"
          />
        </div>
      </div>
    </aside>
  );
}
