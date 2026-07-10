'use client';

import React, { useState, useRef, useEffect } from 'react';

import { TOKENS } from '@/lib/data/tokens';
import { isValidDecimalInput } from '@/lib/utils/currency';
import { TokenLogo } from '@/components/ui/token-logo';

interface RewardPoolSectionProps {
  tokenId: string;
  setTokenId: (id: string) => void;
  rewardAmount: string;
  setRewardAmount: (val: string) => void;
  equivalentFiat: string;
}

export function RewardPoolSection({
  tokenId,
  setTokenId,
  rewardAmount,
  setRewardAmount,
  equivalentFiat,
}: RewardPoolSectionProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableTokens = Object.values(TOKENS);
  const activeToken = TOKENS[tokenId] || TOKENS.XLM;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="border border-border rounded-md p-4 sm:p-5 flex flex-col gap-3 bg-white dark:bg-card mt-2">
      <span className="text-black dark:text-neutral-1 font-medium text-base">
        Set Reward Pool
      </span>
      <div className="flex gap-3">
        
        {/* Token Selection Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-2 px-3 py-2.5 border border-border rounded-md bg-white dark:bg-card hover:bg-neutral-2 dark:hover:bg-neutral-10 cursor-pointer shrink-0 w-[115px] sm:w-[130px] transition-colors"
          >
            <div className="flex items-center gap-2">
              <TokenLogo symbol={activeToken.symbol} size="sm" />
              <span className="font-semibold text-neutral-9 dark:text-neutral-2 text-base">{activeToken.symbol}</span>
            </div>
            <i className="fi fi-rr-angle-small-down text-neutral-7 dark:text-neutral-6 mt-0.5"></i>
          </button>

          {/* Dropdown Options */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-[160px] bg-white dark:bg-card border border-border rounded-md shadow-lg z-50 py-1 overflow-hidden">
              {availableTokens.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTokenId(t.id);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-2 dark:hover:bg-neutral-10 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <TokenLogo symbol={t.symbol} size="sm" />
                    <span className="font-medium text-neutral-9 dark:text-neutral-2 text-base">{t.symbol}</span>
                  </div>
                  {t.id === tokenId && (
                    <i className="fi fi-rr-check text-[#16a34a] text-xs"></i>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reward Pool Amount Input */}
        <div className="flex-grow border border-border rounded-md bg-white dark:bg-card overflow-hidden flex items-center px-3 py-2.5 focus-within:border-neutral-8 transition-colors">
          <input
            type="text"
            inputMode="decimal"
            value={rewardAmount}
            onChange={(e) => {
              const val = e.target.value;
              if (isValidDecimalInput(val)) {
                setRewardAmount(val);
              }
            }}
            placeholder="0"
            className="w-full bg-transparent border-none outline-none font-medium text-neutral-9 dark:text-neutral-2 placeholder:text-neutral-6 text-base"
          />
        </div>
      </div>

      {/* Dynamic fiat conversion */}
      <div className="flex justify-end mt-1 pr-1">
        <span className="text-neutral-8 dark:text-neutral-4 font-medium text-sm">
          Equal to = {equivalentFiat}
        </span>
      </div>
    </div>
  );
}
