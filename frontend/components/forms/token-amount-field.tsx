import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TokenConfig } from '@/lib/data/tokens';
import { isValidDecimalInput } from '@/lib/utils/currency';
import { TokenLogo } from '@/components/ui/token-logo';

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
    <div className={cn("border border-border rounded-md p-4 sm:p-5 md:p-6 flex flex-col gap-2 md:gap-3 bg-white dark:bg-card", className)}>
      {/* Top Row: Label & Accessory */}
      {(label || topRightAccessory) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-neutral-8 font-medium text-[14px]">{label}</span>}
          {topRightAccessory}
        </div>
      )}

      {/* Middle Row: Selectors & Input */}
      <div className="flex gap-2 md:gap-3 items-stretch">
        {/* Token Selector Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={handlePillClick}
            disabled={!showDropdown || (!onTokenClick && (!availableTokens || availableTokens.length === 0))}
            className={cn(
              "flex items-center justify-between gap-1.5 md:gap-3 px-2 md:px-3 h-full min-h-[46px] border border-border rounded-md bg-white dark:bg-card transition-colors shrink-0 w-[110px] md:w-[130px]",
              showDropdown && (onTokenClick || availableTokens) ? "hover:bg-neutral-2 cursor-pointer" : "cursor-default"
            )}
          >
            <div className="flex items-center gap-2">
              <TokenLogo symbol={token.symbol} size="sm" />
              <span className="font-semibold text-black dark:text-neutral-1 text-sm">{token.symbol}</span>
            </div>
            {showDropdown && (onTokenClick || availableTokens) && (
              <i className="fi fi-rr-angle-small-down text-neutral-7 dark:text-neutral-6 mt-0.5"></i>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && availableTokens && (
            <div className="absolute top-full left-0 mt-1 w-[180px] bg-white dark:bg-card border border-border rounded-md shadow-lg z-50 py-1 overflow-hidden">
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
                    <TokenLogo symbol={t.symbol} size="sm" />
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
        <div className="flex-grow border border-border rounded-md bg-white dark:bg-card overflow-hidden flex items-center px-3 h-full min-h-[46px] focus-within:border-neutral-8 transition-colors">
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
              isLg ? "text-xl md:text-2xl lg:text-3xl" : "text-lg md:text-[22px]"
            )}
          />
        </div>
      </div>

      {/* Bottom Row: Fiat Equivalent */}
      <div className="flex justify-end mt-1 pr-1">
        <span className={cn(
          "text-neutral-8 font-medium",
          isLg ? "text-sm sm:text-[15px] md:text-base" : "text-sm sm:text-[15px]"
        )}>
          Equal to = {equivalentFiat}
        </span>
      </div>
    </div>
  );
}
