import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TokenConfig } from '@/lib/data/tokens';
import { isValidDecimalInput } from '@/lib/utils/currency';

interface TokenAmountFieldProps {
  label?: string;
  token: TokenConfig;
  amount: string;
  onAmountChange: (val: string) => void;
  equivalentFiat: string;
  topRightAccessory?: React.ReactNode;
  showDropdown?: boolean;
  onTokenClick?: () => void;
  availableTokens?: TokenConfig[];
  onTokenSelect?: (tokenId: string) => void;
  size?: 'md' | 'lg';
  className?: string;
}

export function TokenAmountField({
  label,
  token,
  amount,
  onAmountChange,
  equivalentFiat,
  topRightAccessory,
  showDropdown = true,
  onTokenClick,
  availableTokens,
  onTokenSelect,
  size = 'md',
  className
}: TokenAmountFieldProps) {
  const isLg = size === 'lg';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handlePillClick = () => {
    if (availableTokens && availableTokens.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
    } else if (onTokenClick) {
      onTokenClick();
    }
  };

  return (
    <div className={cn("border border-neutral-5 rounded-md p-6 flex flex-col gap-3 bg-white dark:bg-card", className)}>
      {/* Top Row: Label & Accessory */}
      {(label || topRightAccessory) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-neutral-8 font-medium text-[14px]">{label}</span>}
          {topRightAccessory}
        </div>
      )}

      {/* Middle Row: Selectors & Input */}
      <div className="flex gap-3">
        {/* Token Selector Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={handlePillClick}
            disabled={!showDropdown || (!onTokenClick && (!availableTokens || availableTokens.length === 0))}
            className={cn(
              "flex items-center justify-between gap-3 px-3 py-2.5 border border-neutral-5 rounded-md bg-white dark:bg-card transition-colors shrink-0 w-[130px]",
              showDropdown && (onTokenClick || availableTokens) ? "hover:bg-neutral-2 cursor-pointer" : "cursor-default"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0", token.logoBg)}>
                <i className={cn(token.logoIcon, "text-[11px] mt-0.5")}></i>
              </div>
              <span className="font-semibold text-black dark:text-neutral-1 text-sm">{token.symbol}</span>
            </div>
            {showDropdown && (onTokenClick || availableTokens) && (
              <i className="fi fi-rr-angle-small-down text-neutral-7 dark:text-neutral-6 mt-0.5"></i>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && availableTokens && (
            <div className="absolute top-full left-0 mt-1 w-[180px] bg-white dark:bg-card border border-neutral-5 rounded-md shadow-lg z-50 py-1 overflow-hidden">
              {availableTokens.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (onTokenSelect) onTokenSelect(t.id);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-2 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0", t.logoBg)}>
                      <i className={cn(t.logoIcon, "text-[11px] mt-0.5")}></i>
                    </div>
                    <span className="font-medium text-black dark:text-neutral-1 text-sm">{t.symbol}</span>
                  </div>
                  {t.id === token.id && (
                    <i className="fi fi-rr-check text-[#16a34a] text-xs"></i>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="flex-grow border border-neutral-5 rounded-md bg-white dark:bg-card overflow-hidden flex items-center px-3 py-1.5 focus-within:border-neutral-8 transition-colors">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (isValidDecimalInput(val)) {
                onAmountChange(val);
              }
            }}
            placeholder="0"
            className={cn(
              "w-full bg-transparent border-none outline-none font-medium text-black dark:text-neutral-1 placeholder:text-neutral-6",
              isLg ? "text-2xl md:text-3xl" : "text-[22px]"
            )}
          />
        </div>
      </div>

      {/* Bottom Row: Fiat Equivalent */}
      <div className="flex justify-end mt-1 pr-1">
        <span className={cn(
          "text-neutral-8 font-medium",
          isLg ? "text-[16px] md:text-base" : "text-[15px]"
        )}>
          Equal to = {equivalentFiat}
        </span>
      </div>
    </div>
  );
}
