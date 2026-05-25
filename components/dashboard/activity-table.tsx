import React from 'react';
import { ActivityRow, ActivityRowProps } from './activity-row';

const ACTIVITY_DATA: ActivityRowProps[] = [
  {
    icon: 'fi fi-rr-download',
    iconBgClass: 'bg-[#fffbeb]',
    iconColorClass: 'text-[#f59e0b]',
    type: 'Received token',
    details: 'From @raka',
    amount: '120 XLM',
    status: 'success',
    time: '2 minutes ago',
  },
  {
    icon: 'fi fi-rr-shuffle',
    iconBgClass: 'bg-[#eff6ff]',
    iconColorClass: 'text-[#3b82f6]',
    type: 'Swap token',
    details: 'XLM to USDC',
    amount: '200 XLM',
    status: 'success',
    time: '3 days ago',
  },
  {
    icon: 'fi fi-rr-paper-plane',
    iconBgClass: 'bg-[#eafdf0]',
    iconColorClass: 'text-[#16a34a]',
    type: 'Sent token',
    details: 'To @erikghafari',
    amount: '180 XLM',
    status: 'processing',
    time: '6 days ago',
  },
  {
    icon: 'fi fi-rr-gift',
    iconBgClass: 'bg-[#f6eefe]',
    iconColorClass: 'text-[#a855f7]',
    type: 'Gift claim',
    details: 'Ramadhan Berkah Room',
    amount: '1,254 XLM',
    status: 'expired',
    time: '2 weeks ago',
  },
];

export interface ActivityTableProps {
  data?: ActivityRowProps[];
}

export function ActivityTable({ data = ACTIVITY_DATA }: ActivityTableProps) {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-3 border border-neutral-5 rounded-tr-md rounded-tl-md">
        <div className="col-span-1 flex items-center gap-2 text-sm font-medium text-black">
          Activity Type <i className="fi fi-rr-caret-down text-[10px] text-neutral-7" />
        </div>
        <div className="col-span-1 flex items-center gap-2 text-sm font-medium text-black">
          Details <i className="fi fi-rr-caret-down text-[10px] text-neutral-7" />
        </div>
        <div className="col-span-1 flex items-center gap-2 text-sm font-medium text-black">
          Amount <i className="fi fi-rr-caret-down text-[10px] text-neutral-7" />
        </div>
        <div className="col-span-1 flex items-center gap-2 text-sm font-medium text-black">
          Status <i className="fi fi-rr-caret-down text-[10px] text-neutral-7" />
        </div>
        <div className="col-span-1 flex items-center justify-end gap-2 text-sm font-medium text-black text-right">
          Time <i className="fi fi-rr-caret-down text-[10px] text-neutral-7" />
        </div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col">
        {data.map((row, idx) => (
          <ActivityRow
            key={idx}
            {...row}
            isLast={idx === data.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
