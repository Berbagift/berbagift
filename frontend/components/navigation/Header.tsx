"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { roomService } from "@/services/room.service";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useWalletStore } from "@/hooks/use-wallet-state";

interface HeaderProps {
  onMenuClick?: () => void;
  isDesktopSidebarOpen?: boolean;
  onDesktopToggle?: () => void;
}

const getPageTitle = (pathname: string) => {
  if (pathname.includes("/activity")) return "All Activity";
  if (pathname.includes("/inbox")) return "My Inbox";
  if (pathname.includes("/balance")) return "My Balance";
  if (pathname.includes("/swap")) return "Swap Token";
  if (pathname.includes("/sendthr")) return "Send THR";
  if (pathname.includes("/rooms")) return "Explore Rooms";
  if (pathname.includes("/create-room")) return "Create Room";
  if (pathname.includes("/profile")) return "My Profile";
  if (pathname.includes("/help")) return "Help Center";
  return "Overview";
};

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function BreadcrumbNav({
  items,
  isMobile = false
}: {
  items: BreadcrumbItem[];
  isMobile?: boolean
}) {
  const textSize = isMobile ? "text-lg" : "text-2xl";

  return (
    <nav aria-label="Breadcrumb" className="min-h-0 min-w-0">
      <ol className={`flex items-center gap-2 font-semibold text-black dark:text-neutral-1 ${textSize}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <li className="flex items-center text-neutral-6">
                  <i aria-hidden="true" className="fi fi-rr-angle-small-right text-[0.85em] leading-none" />
                </li>
              )}
              <li className={`min-w-0 ${isLast ? 'flex items-center gap-2' : ''}`}>
                {!isLast && item.href ? (
                  <Link
                    href={item.href}
                    className="block truncate text-neutral-8 dark:text-neutral-6 transition-colors hover:text-black dark:text-neutral-1 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined} className="truncate">
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export function Header({ onMenuClick, isDesktopSidebarOpen = true, onDesktopToggle }: HeaderProps) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { publicKey, disconnect } = useWalletStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const pageTitle = getPageTitle(pathname || "");
  const isEnvelopePage = pathname === "/sendthr/envelope";
  const isRoomDetailPage = pathname?.startsWith("/dashboard/rooms/join/") && params?.roomId;

  const handleDisconnect = () => {
    setIsProfileOpen(false);
    disconnect();
    router.push("/");
  };

  const renderTitle = (isMobile: boolean = false) => {
    if (isEnvelopePage) {
      return (
        <BreadcrumbNav
          isMobile={isMobile}
          items={[
            { label: "Send THR", href: "/dashboard/sendthr" },
            { label: "Envelope Design" }
          ]}
        />
      );
    }

    if (isRoomDetailPage) {
      return (
        <BreadcrumbNav
          isMobile={isMobile}
          items={[
            { label: "Explore Rooms", href: "/dashboard/rooms" },
            { label: "Detail Room" }
          ]}
        />
      );
    }

    return (
      <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold text-black dark:text-neutral-1`}>
        {pageTitle}
      </h1>
    );
  };

  return (
    <header className="h-20 border-b border-neutral-5 bg-background flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Logo - Mobile Only */}
        <div className="lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="https://placehold.co/40x40/transparent/000000?text=B" alt="BagiTHR Logo" className="h-6 w-6 object-contain" />
            <div className="text-xl font-medium flex items-center">
              <span className="text-black dark:text-neutral-1">Bagi</span>
              <span className="text-primary-500">THR</span>
            </div>
          </Link>
        </div>

        {/* Desktop Hamburger & Logo (Shown only when Sidebar is collapsed) */}
        {!isDesktopSidebarOpen && (
          <div className="hidden lg:flex items-center gap-3 mr-2">

            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="https://placehold.co/40x40/transparent/000000?text=B" alt="BagiTHR Logo" className="h-6 w-6 object-contain" />
              <div className="text-xl font-medium flex items-center">
                <span className="text-black dark:text-neutral-1">Bagi</span>
                <span className="text-primary-500">THR</span>
              </div>
            </Link>
            <div className="w-px h-6 bg-neutral-5 mx-2" />
          </div>
        )}
        <div className="hidden lg:block min-w-0">
          {renderTitle(false)}
        </div>
      </div>

      {/* Center title on mobile */}
      <div className="absolute left-1/2 -translate-x-1/2 lg:hidden pointer-events-none">
        <div className="pointer-events-auto max-w-[58vw]">
          {renderTitle(true)}
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        <ThemeToggle />
        {/* Profile Section */}
        <div className="relative">
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
              {publicKey ? publicKey.substring(0, 2).toUpperCase() : "USR"}
            </div>
            <div className="hidden sm:block text-sm text-left">
              <p className="font-semibold text-black dark:text-neutral-1 leading-none mb-1">My Wallet</p>
              <p className="text-neutral-7 dark:text-neutral-6 text-xs leading-none">
                {publicKey ? `${publicKey.substring(0, 5)}...${publicKey.substring(publicKey.length - 4)}` : "Disconnected"}
              </p>
            </div>
            <i className={`fi fi-rr-angle-small-down ml-1 text-xs text-neutral-6 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-12 border border-neutral-5 dark:border-neutral-10 rounded-xl shadow-sm py-1.5 z-20 overflow-hidden">
                <button
                  onClick={handleDisconnect}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <i className="fi fi-rr-sign-out-alt text-base" />
                  Disconnect Wallet
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-black dark:text-neutral-1 hover:bg-neutral-5 dark:hover:bg-neutral-10 rounded-md transition-colors"
        >
          <i className="fi fi-rr-menu-burger text-lg mt-1" />
        </button>
      </div>
    </header>
  );
}
