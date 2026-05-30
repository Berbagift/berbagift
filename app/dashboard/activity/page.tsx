import React from 'react';
import { ActivityTable } from '@/components/dashboard/activity-table';
import { ActivityRowProps } from '@/components/dashboard/activity-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ALL_ACTIVITY_DATA: ActivityRowProps[] = [
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
  {
    icon: 'fi fi-rr-download',
    iconBgClass: 'bg-[#fffbeb]',
    iconColorClass: 'text-[#f59e0b]',
    type: 'Received token',
    details: 'From @johndoe',
    amount: '50 XLM',
    status: 'success',
    time: '3 weeks ago',
  },
  {
    icon: 'fi fi-rr-paper-plane',
    iconBgClass: 'bg-[#eafdf0]',
    iconColorClass: 'text-[#16a34a]',
    type: 'Sent token',
    details: 'To @sarah',
    amount: '10 USDC',
    status: 'success',
    time: '1 month ago',
  },
  {
    icon: 'fi fi-rr-apps-add',
    iconBgClass: 'bg-[#eff6ff]',
    iconColorClass: 'text-[#3b82f6]',
    type: 'Created Room',
    details: 'Weekly Giveaway',
    amount: '0 XLM',
    status: 'success',
    time: '1 month ago',
  },
];

export default function AllActivityPage() {
  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Top Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-7 dark:text-neutral-6 mt-[2px]" />
          <Input 
            type="text" 
            placeholder="Search activity..." 
            className="pl-10 h-10 rounded-md border-neutral-4 dark:border-border bg-white dark:bg-card"
          />
        </div>
        <Button variant="outline" className="h-10 rounded-md border-neutral-4 dark:border-border text-black dark:text-neutral-1 flex items-center gap-2">
          <i className="fi fi-rr-filter mt-[2px]" />
          Filter Type
        </Button>
      </div>

      {/* Table Container */}
      <div className="border border-neutral-5 rounded-md p-5 bg-white dark:bg-card">
        <ActivityTable data={ALL_ACTIVITY_DATA} />
      </div>
    </div>
  );
}
