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
      { name: 'My Balance', href: '/wallet/balance', icon: 'fi fi-rr-wallet' },
      { name: 'Swap Token', href: '/wallet/swap', icon: 'fi fi-rr-shuffle' },
    ],
  },
  {
    section: 'COMMUNITY',
    items: [
      { name: 'Explore Rooms', href: '/community/explore', icon: 'fi fi-rr-grid' },
      { name: 'My Rooms', href: '/community/myrooms', icon: 'fi fi-rr-folder' },
    ],
  },
  {
    section: 'ACCOUNT',
    items: [
      { name: 'My Profile', href: '/account/profile', icon: 'fi fi-rr-user' },
      { name: 'Help Center', href: '/account/help', icon: 'fi fi-rr-info' },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDesktopOpen?: boolean;
  onDesktopToggle?: () => void;
}

export function Sidebar({ isOpen, onClose, isDesktopOpen = true, onDesktopToggle }: SidebarProps) {
  const pathname = usePathname();

  // Find the most specific active route (longest matching prefix)
  const activeHref = SIDEBAR_NAV.flatMap((group) => group.items)
    .filter((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 border-r border-border bg-background flex flex-col z-40 transition-all duration-300 ease-in-out overflow-x-hidden",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isDesktopOpen ? "w-[280px]" : "w-[280px] lg:w-[80px]"
      )}
    >
      {/* Logo and Mobile Close */}
      <div className={cn(
        "h-20 flex items-center shrink-0",
        isDesktopOpen ? "justify-between px-6 lg:px-8" : "justify-between lg:justify-center px-6 lg:px-0"
      )}>
        {/* Mobile Logo */}
        <Link href="/dashboard" className="flex lg:hidden items-center gap-2" onClick={onClose}>
          <img src="https://placehold.co/40x40/transparent/000000?text=B" alt="BagiTHR Logo" className="h-8 w-8 object-contain" />
          <div className="text-2xl font-medium flex items-center">
            <span className="text-black dark:text-neutral-1">Bagi</span>
            <span className="text-primary-500">THR</span>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-7 dark:text-neutral-6 hover:text-black dark:text-neutral-1 dark:hover:text-white transition-colors rounded-md hover:bg-neutral-5 dark:hover:bg-neutral-10"
        >
          <i className="fi fi-rr-cross text-base" />
        </button>

        {/* Desktop Logo / Toggle */}
        <div className={cn("hidden lg:flex items-center", isDesktopOpen ? "justify-between w-full" : "justify-center w-full")}>
          {isDesktopOpen ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2">
                <img src="https://placehold.co/40x40/transparent/000000?text=B" alt="BagiTHR Logo" className="h-8 w-8 object-contain" />
                <div className="text-2xl font-medium flex items-center">
                  <span className="text-black dark:text-neutral-1">Bagi</span>
                  <span className="text-primary-500">THR</span>
                </div>
              </Link>
              <button onClick={onDesktopToggle} className="w-8 h-8 flex items-center justify-center text-neutral-7 dark:text-neutral-6 hover:text-black dark:text-neutral-1 dark:hover:text-white hover:bg-neutral-5 dark:hover:bg-neutral-10 rounded-md transition-colors cursor-pointer">
                <i className="fi fi-rr-sidebar text-base mt-0.5" />
              </button>
            </>
          ) : (
            <button onClick={onDesktopToggle} className="w-10 h-10 flex items-center justify-center text-neutral-7 dark:text-neutral-6 hover:text-black dark:text-neutral-1 dark:hover:text-white hover:bg-neutral-5 dark:hover:bg-neutral-10 rounded-md transition-colors cursor-pointer">
              <i className="fi fi-rr-sidebar text-xl mt-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <div className={cn("flex-1 overflow-y-auto py-2 space-y-6 custom-scrollbar", isDesktopOpen ? "px-8" : "px-8 lg:px-4")}>
        {SIDEBAR_NAV.map((group, i) => (
          <div key={i} className="flex flex-col gap-2">
            <h3 className={cn(
              "text-xs font-semibold text-neutral-7 dark:text-neutral-6 uppercase tracking-wider transition-all duration-300",
              isDesktopOpen ? "opacity-100" : "lg:opacity-0 lg:h-0 lg:overflow-hidden lg:mb-0 lg:hidden"
            )}>
              {group.section}
            </h3>
            <div className="flex flex-col gap-1 mt-1">
              {group.items.map((item, j) => {
                const isActive = item.href === activeHref;
                return (
                  <Link
                    key={j}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 py-2 rounded-md text-[15px] font-medium transition-colors whitespace-nowrap",
                      isDesktopOpen ? "px-3" : "px-3 lg:justify-center lg:px-0",
                      isActive
                        ? "bg-primary-100 text-black"
                        : "text-black dark:text-neutral-1 dark:text-neutral-4 hover:bg-neutral-3 dark:hover:bg-neutral-10"
                    )}
                  >
                    <i className={cn(item.icon, "text-[18px] flex-shrink-0 w-5 text-center mt-[1px]")} />
                    <span className={cn(
                      "transition-all duration-300",
                      isDesktopOpen ? "opacity-100" : "lg:opacity-0 lg:w-0 lg:hidden"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
            {/* Minimal separator if needed, based on design there's a subtle line between sections */}
            {i < SIDEBAR_NAV.length - 1 && (
              <div className="h-px bg-neutral-5 dark:bg-border mt-4" />
            )}
          </div>
        ))}
      </div>

      {/* Bottom Invite Card Placeholder */}
      <div className={cn("px-8 pb-8 transition-opacity duration-300 flex-shrink-0", isDesktopOpen ? "opacity-100 delay-150" : "lg:opacity-0 lg:pointer-events-none")}>
        <div className="w-[216px] bg-emerald-50 dark:bg-emerald-950/50 rounded-md p-4 border border-border flex flex-col gap-3 relative overflow-hidden">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-50 leading-tight z-10 w-2/3">
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
