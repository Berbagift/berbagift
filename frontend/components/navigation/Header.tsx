"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useWalletStore } from "@/hooks/use-wallet-state";
import { removeAuthToken } from "@/lib/auth";
import { useUserProfile } from "@/hooks/use-user-profile";

interface HeaderProps {
  onMenuClick?: () => void;
  isDesktopSidebarOpen?: boolean;
  onDesktopToggle?: () => void;
}

import { Breadcrumbs, ROUTE_BREADCRUMBS } from "@/components/navigation/Breadcrumbs";

export function Header({ onMenuClick, isDesktopSidebarOpen = true }: HeaderProps) {
  const pathname = usePathname();
  const params = useParams();
  const { publicKey, disconnect } = useWalletStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: userProfile } = useUserProfile();
  
  const isEnvelopePage = pathname === "/sendthr/envelope";
  const isRoomDetailPage = pathname?.startsWith("/community/explore/join/") && params?.roomId;

  const handleDisconnect = () => {
    setIsProfileOpen(false);
    removeAuthToken();
    disconnect();
    window.location.href = "/";
  };

  const renderTitle = (isMobile: boolean = false) => {
    if (isEnvelopePage && isMobile) {
      return (
        <Link href="/sendthr" className="flex items-center gap-2 text-lg font-semibold text-black dark:text-neutral-1 hover:opacity-80 transition-opacity">
          <i className="fi fi-rr-arrow-left text-base mt-0.5" />
          <span className="truncate">Envelope Design</span>
        </Link>
      );
    }

    if (isRoomDetailPage) {
      if (isMobile) {
        return (
          <Link href="/community/explore" className="flex items-center gap-2 text-lg font-semibold text-black dark:text-neutral-1 hover:opacity-80 transition-opacity">
            <i className="fi fi-rr-arrow-left text-base mt-0.5" />
            <span className="truncate">Detail Room</span>
          </Link>
        );
      }
      return (
        <Breadcrumbs
          isMobile={isMobile}
          items={[
            { label: "Community" },
            { label: "Explore Rooms", href: "/community/explore" },
            { label: "Detail Room" }
          ]}
        />
      );
    }

    const defaultItems = [{ label: "Dashboard" }, { label: "Overview" }];
    const items = ROUTE_BREADCRUMBS[pathname || ""] || defaultItems;

    return <Breadcrumbs isMobile={isMobile} items={items} />;
  };

  return (
    <header className="h-20 border-b border-border bg-background flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Burger Icon - Mobile Only (Acts as Sidebar Toggle) */}
        <div className="lg:hidden">
          <button 
            onClick={onMenuClick} 
            className="w-10 h-10 flex items-center justify-center text-neutral-8 dark:text-neutral-3 hover:text-black dark:hover:text-white hover:bg-neutral-3 dark:hover:bg-neutral-10 rounded-md transition-colors focus:outline-none"
            aria-label="Open Sidebar"
          >
            <i className="fi fi-rr-menu-burger text-lg flex items-center" />
          </button>
        </div>

        {/* Desktop Hamburger & Logo (Shown only when Sidebar is collapsed) */}
        {!isDesktopSidebarOpen && (
          <div className="hidden lg:flex items-center gap-3 mr-2">

            <Link href="/dashboard" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/Brandlogo.svg" alt="Berbagift Logo" className="h-6 w-6 object-contain" />
              <div className="text-xl font-medium flex items-center">
                <span className="text-primary-500">Berbagift</span>
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
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
        {/* Profile Section */}
        <div className="relative">
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {userProfile?.avatar_url ? (
              <img 
                src={userProfile.avatar_url} 
                alt="User Avatar" 
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover bg-emerald-100"
              />
            ) : (
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                {userProfile?.username ? userProfile.username.substring(0, 2).toUpperCase() : (publicKey ? publicKey.substring(0, 2).toUpperCase() : "USR")}
              </div>
            )}
            <div className="hidden sm:block text-sm text-left">
              <p className="font-semibold text-black dark:text-neutral-1 leading-none mb-1">
                {userProfile?.username ? userProfile.username : "My Wallet"}
              </p>
              <p className="text-neutral-7 dark:text-neutral-6 text-xs leading-none">
                {publicKey ? `${publicKey.substring(0, 4)}....${publicKey.substring(publicKey.length - 4)}` : "Disconnected"}
              </p>
            </div>
            <i className={`fi fi-rr-angle-small-down ml-1 text-xs text-neutral-6 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-12 border border-neutral-5 dark:border-neutral-10 rounded-xl shadow-sm py-1.5 z-20 overflow-hidden">
                {/* Mobile-only Theme Toggle inside Dropdown */}
                <div className="lg:hidden flex items-center justify-between px-4 py-2 border-b border-neutral-5 dark:border-neutral-10 mb-1.5">
                  <span className="text-sm font-medium text-neutral-8 dark:text-neutral-3">Theme Mode</span>
                  <div className="scale-90 origin-right">
                    <ThemeToggle />
                  </div>
                </div>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="block px-4 py-2.5 text-sm text-neutral-8 dark:text-neutral-3 hover:bg-neutral-3 dark:hover:bg-neutral-10 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <i className="fi fi-rr-user text-base" />
                  My Profile
                </Link>
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
      </div>
    </header>
  );
}
