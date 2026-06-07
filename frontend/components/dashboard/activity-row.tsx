import React from 'react';
import { StatusBadge, StatusType } from './status-badge';
import { cn } from '@/lib/utils';

export interface ActivityRowProps {
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  type: string;
  details: string;
  amount: string;
  status: StatusType;
  time: string;
  isLast?: boolean;
}

export function ActivityRow({
  icon,
  iconBgClass,
  iconColorClass,
  type,
  details,
  amount,
  status,
  time,
  isLast,
}: ActivityRowProps) {
  return (
    <>
      {/* Mobile Layout */}
      <div className={cn("flex flex-col md:hidden gap-3 py-4 px-4 text-sm", !isLast && "border-b border-neutral-5")}>
        {/* Top Mobile Row */}
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", iconBgClass, iconColorClass)}>
              <i className={icon} />
            </div>
            <span className="font-medium text-black dark:text-neutral-1">{type}</span>
          </div>
          <div className="text-xs text-neutral-7 dark:text-neutral-6">
            {time}
          </div>
        </div>

        {/* Details & Amount */}
        <div className="flex flex-row justify-between items-center">
          <div className="text-black dark:text-neutral-1">{details}</div>
          <div className="font-medium text-black dark:text-neutral-1">{amount}</div>
        </div>

        {/* Status */}
        <div className="flex flex-row justify-between items-center mt-1">
          <div><StatusBadge status={status} /></div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className={cn("hidden md:grid grid-cols-5 items-center gap-4 py-4 px-4 text-sm", !isLast && "border-b border-neutral-5")}>
        <div className="col-span-1 flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", iconBgClass, iconColorClass)}>
            <i className={icon} />
          </div>
          <span className="font-medium text-black dark:text-neutral-1">{type}</span>
        </div>
        <div className="col-span-1 text-black dark:text-neutral-1">
          {details}
        </div>
        <div className="col-span-1 font-medium text-black dark:text-neutral-1">
          {amount}
        </div>
        <div className="col-span-1">
          <StatusBadge status={status} />
        </div>
        <div className="col-span-1 text-right text-neutral-7 dark:text-neutral-6">
          {time}
        </div>
      </div>
    </>
  );
}
