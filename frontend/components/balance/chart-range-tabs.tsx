'use client';

import { useState } from 'react';

const RANGES = ['1 Day', '1 Week', '1 Month', '1 Year', '3 Year', '5 Year'];

export function ChartRangeTabs() {
  const [activeRange, setActiveRange] = useState('1 Year');

  return (
    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar bg-neutral-2/50 p-1 rounded-md">
      {RANGES.map((range) => {
        const isActive = activeRange === range;
        return (
          <button
            key={range}
            onClick={() => setActiveRange(range)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors
              ${
                isActive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-black dark:text-neutral-1 hover:bg-neutral-3'
              }
            `}
          >
            {range}
          </button>
        );
      })}
    </div>
  );
}
