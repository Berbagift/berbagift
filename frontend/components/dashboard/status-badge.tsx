import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 'success' | 'processing' | 'expired';

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    success: { label: 'Success', icon: 'fi fi-rr-check', classes: 'bg-[#eafdf0] text-[#16a34a]' },
    processing: { label: 'Processing', icon: 'fi fi-rr-time-forward', classes: 'bg-[#eff6ff] text-[#3b82f6]' },
    expired: { label: 'Expired', icon: 'fi fi-rr-cross', classes: 'bg-[#fef5e7] text-[#f59e0b]' },
  };

  const { label, icon, classes } = config[status];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium", classes)}>
      <i className={cn(icon, "text-[10px]")} />
      {label}
    </div>
  );
}
