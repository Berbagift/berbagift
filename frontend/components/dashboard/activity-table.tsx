import React from 'react';
import { ActivityRow, ActivityRowProps } from './activity-row';
import { StatusState } from '@/components/shared/status-state';

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
      <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 border border-border rounded-t-md bg-white dark:bg-card">
        <div className="col-span-1 flex items-center gap-2 text-sm font-medium text-black dark:text-neutral-1">
          Activity Type <i className="fi fi-rr-caret-down text-[10px] text-neutral-7 dark:text-neutral-6" />
        </div>
        <div className="col-span-1 flex items-center gap-2 text-sm font-medium text-black dark:text-neutral-1">
          Details <i className="fi fi-rr-caret-down text-[10px] text-neutral-7 dark:text-neutral-6" />
        </div>
        <div className="col-span-1 flex items-center gap-2 text-sm font-medium text-black dark:text-neutral-1">
          Amount <i className="fi fi-rr-caret-down text-[10px] text-neutral-7 dark:text-neutral-6" />
        </div>
        <div className="col-span-1 flex items-center gap-2 text-sm font-medium text-black dark:text-neutral-1">
          Status <i className="fi fi-rr-caret-down text-[10px] text-neutral-7 dark:text-neutral-6" />
        </div>
        <div className="col-span-1 flex items-center justify-end gap-2 text-sm font-medium text-black dark:text-neutral-1 text-right">
          Time <i className="fi fi-rr-caret-down text-[10px] text-neutral-7 dark:text-neutral-6" />
        </div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col bg-white dark:bg-card">
        {data.length === 0 ? (
          <StatusState
            icon="fi-rr-inbox"
            title="No activity records found."
            iconColorClass="text-neutral-400 dark:text-neutral-600"
            bgColorClass="bg-neutral-50 dark:bg-neutral-900/30"
            className="py-16"
          />
        ) : (
          data.map((row, idx) => (
            <ActivityRow
              key={idx}
              {...row}
              isLast={idx === data.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
