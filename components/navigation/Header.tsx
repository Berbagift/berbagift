"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onMenuClick?: () => void;
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

function SendThrEnvelopeTitle({ isMobile = false }: { isMobile?: boolean }) {
  const textSize = isMobile ? "text-lg" : "text-2xl";

  return (
    <nav aria-label="Send THR progress" className="min-w-0">
      <ol
        className={`flex items-center gap-2 font-semibold text-black ${textSize}`}
      >
        <li className="min-w-0">
          <Link
            href="/sendthr"
            className="block truncate text-neutral-8 transition-colors hover:text-black"
          >
            Send THR
          </Link>
        </li>
        <li className="flex items-center gap-2 min-w-0">
          <i
            aria-hidden="true"
            className="fi fi-rr-angle-small-right text-[0.85em] leading-none text-neutral-6"
          />
          <span aria-current="page" className="truncate">
            Envelope Design
          </span>
        </li>
      </ol>
    </nav>
  );
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname || "");
  const isEnvelopePage = pathname === "/sendthr/envelope";

  return (
    <header className="h-20 border-b border-neutral-5 bg-background flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Logo - Mobile Only */}
        <div className="lg:hidden">
          <Link href="/dashboard" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://placehold.co/120x40/transparent/000000?text=BagiTHR"
              alt="BagiTHR Logo"
              className="h-6 object-contain"
            />
          </Link>
        </div>
        <div className="hidden lg:block min-w-0">
          {isEnvelopePage ? (
            <SendThrEnvelopeTitle />
          ) : (
            <h1 className="text-2xl font-semibold text-black">{pageTitle}</h1>
          )}
        </div>
      </div>

      {/* Center title on mobile */}
      <div className="absolute left-1/2 -translate-x-1/2 lg:hidden pointer-events-none">
        {isEnvelopePage ? (
          <div className="pointer-events-auto max-w-[58vw]">
            <SendThrEnvelopeTitle isMobile />
          </div>
        ) : (
          <h1 className="text-lg font-semibold text-black">{pageTitle}</h1>
        )}
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Profile Section */}
        <div className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
            FH
          </div>
          <div className="hidden sm:block text-sm text-left">
            <p className="font-semibold text-black leading-none mb-1">Faiz</p>
            <p className="text-neutral-7 text-xs leading-none">
              @faizhazan.creator
            </p>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-black hover:bg-neutral-5 rounded-md transition-colors"
        >
          <i className="fi fi-rr-menu-burger text-lg mt-1" />
        </button>
      </div>
    </header>
  );
}
