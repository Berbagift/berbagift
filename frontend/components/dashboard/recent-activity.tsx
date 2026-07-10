"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ActivityTable } from './activity-table';

export function RecentActivitySection() {
  const router = useRouter();

  return (
    <div className="border border-border rounded-md p-5 bg-card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black dark:text-neutral-1">My Recent Activity</h2>
        <button onClick={() => router.push('/dashboard/activity')} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-black dark:text-neutral-1 border border-border rounded-md hover:bg-neutral-5/50 transition-colors">
          View All <i className="fi fi-rr-angle-right text-[10px]" />
        </button>
      </div>
      <ActivityTable />
    </div>
  );
}
