import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-20 border-b border-neutral-5 bg-background flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Logo - Mobile Only */}
        <div className="lg:hidden">
          <Link href="/dashboard" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://placehold.co/120x40/transparent/000000?text=BagiTHR" alt="BagiTHR Logo" className="h-6 object-contain" />
          </Link>
        </div>
        <h1 className="text-xl font-semibold text-black hidden lg:block">Overview</h1>
      </div>

      {/* Center title on mobile */}
      <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
        <h1 className="text-lg font-semibold text-black">Overview</h1>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Profile Section */}
        <div className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
            FH
          </div>
          <div className="hidden sm:block text-sm text-right">
            <p className="font-semibold text-black leading-none mb-1">Faiz</p>
            <p className="text-neutral-7 text-xs leading-none">@faizhazan.creator</p>
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
