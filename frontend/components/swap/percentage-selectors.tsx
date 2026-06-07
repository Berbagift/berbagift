import React from 'react';
import { cn } from '@/lib/utils';

interface PercentageSelectorsProps {
  activePercentage: number | null;
  onSelect: (percentage: number) => void;
}

export function PercentageSelectors({ activePercentage, onSelect }: PercentageSelectorsProps) {
  const options = [
    { label: '20%', value: 20 },
    { label: '50%', value: 50 },
    { label: 'MAX', value: 100 },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-neutral-2 rounded-md p-0.5 h-7">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onSelect(opt.value)}
          className={cn(
            "text-base font-medium px-2 h-full rounded transition-colors",
            activePercentage === opt.value
              ? "bg-[#e8f5e9] text-[#22c55e]"
              : "text-black dark:text-neutral-1 hover:bg-neutral-3"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
