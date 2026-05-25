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
    <div className={cn("flex flex-col md:grid md:grid-cols-5 md:items-center gap-3 md:gap-4 py-4 px-4 text-sm", !isLast && "border-b border-neutral-5")}>
      {/* Top Mobile Row / Desktop Col 1 */}
      <div className="flex flex-row items-center justify-between w-full md:w-auto col-span-1">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", iconBgClass, iconColorClass)}>
            <i className={icon} />
          </div>
          <span className="font-medium text-black">{type}</span>
        </div>
        <div className="md:hidden text-xs text-neutral-7">
          {time}
        </div>
      </div>

      {/* Details & Amount wrapper for mobile / Desktop Cols 2 & 3 */}
      <div className="flex flex-row justify-between items-center md:contents">
        <div className="col-span-1 text-black">
          {details}
        </div>
        <div className="col-span-1 font-medium text-black">
          {amount}
        </div>
      </div>

      {/* Status & Time (Desktop) for mobile / Desktop Cols 4 & 5 */}
      <div className="flex flex-row justify-between items-center md:contents mt-1 md:mt-0">
        <div className="col-span-1">
          <StatusBadge status={status} />
        </div>
        <div className="hidden md:block col-span-1 text-right text-neutral-7">
          {time}
        </div>
      </div>
    </div>
  );
}
