import React from 'react';
import { cn } from '@/lib/utils';

interface FeeBadgeProps {
  feeText: string;
  icon?: string;
  className?: string;
}

export function FeeBadge({ feeText, icon = "fi-rr-shuffle", className }: FeeBadgeProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <div className="flex items-center gap-1.5 bg-[#f0fdf4] text-[#16a34a] px-3 py-1 rounded-md text-base font-medium">
        <i className={`fi ${icon} text-base mt-1`}></i>
        <span>{feeText}</span>
      </div>
    </div>
  );
}
