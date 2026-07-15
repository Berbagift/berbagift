'use client';

import React from 'react';
import { ActivityRow } from './activity-row';
import { StatusState } from '@/components/shared/status-state';
import { useActivities } from '@/lib/api/queries';
import { Activity } from '@/lib/api/types';

export const ActivityTableSkeleton = () => (
  <div className="w-full">
    <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 border border-border rounded-t-md bg-emerald-50/50 dark:bg-emerald-900/10 animate-pulse">
       <div className="h-4 bg-emerald-100/80 dark:bg-emerald-800/30 rounded w-20"></div>
       <div className="h-4 bg-emerald-100/80 dark:bg-emerald-800/30 rounded w-24"></div>
       <div className="h-4 bg-emerald-100/80 dark:bg-emerald-800/30 rounded w-16"></div>
       <div className="h-4 bg-emerald-100/80 dark:bg-emerald-800/30 rounded w-16"></div>
       <div className="h-4 bg-emerald-100/80 dark:bg-emerald-800/30 rounded w-16"></div>
       <div className="h-4 bg-emerald-100/80 dark:bg-emerald-800/30 rounded w-20 justify-self-end"></div>
    </div>
    <div className="flex flex-col bg-white dark:bg-card">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`flex flex-col md:grid md:grid-cols-6 gap-3 md:gap-4 px-6 py-4 bg-emerald-50/30 dark:bg-emerald-900/5 animate-pulse ${i !== 4 ? 'border-b border-border' : ''}`}>
          <div className="h-6 w-3/4 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
          <div className="h-6 w-full bg-emerald-100/80 dark:bg-emerald-800/30 rounded hidden md:block" />
          <div className="h-6 w-1/2 bg-emerald-100/80 dark:bg-emerald-800/30 rounded hidden md:block" />
          <div className="h-6 w-24 bg-emerald-100/80 dark:bg-emerald-800/30 rounded hidden md:block" />
          <div className="h-6 w-24 bg-emerald-100/80 dark:bg-emerald-800/30 rounded hidden md:block" />
          <div className="h-6 w-1/3 bg-emerald-100/80 dark:bg-emerald-800/30 rounded md:justify-self-end hidden md:block" />
        </div>
      ))}
    </div>
  </div>
);

export interface ActivityTableProps {
  data?: Activity[];
}

export function ActivityTable({ data }: ActivityTableProps) {
  const { data: fetchedActivities = [], isLoading } = useActivities();

  const displayData = data !== undefined ? data : fetchedActivities.slice(0, 4);

  if (isLoading && data === undefined) {
    return <ActivityTableSkeleton />;
  }
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 border border-border rounded-t-md bg-white dark:bg-card">
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
        <div className="col-span-1 flex items-center gap-2 text-sm font-medium text-black dark:text-neutral-1">
          Tx Hash
        </div>
        <div className="col-span-1 flex items-center justify-end gap-2 text-sm font-medium text-black dark:text-neutral-1 text-right">
          Time <i className="fi fi-rr-caret-down text-[10px] text-neutral-7 dark:text-neutral-6" />
        </div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col bg-white dark:bg-card overflow-y-auto custom-scrollbar max-h-[600px] md:max-h-[700px]">
        {displayData.length === 0 ? (
          <StatusState
            icon="fi-rr-inbox"
            title="No activity records found."
            iconColorClass="text-neutral-400 dark:text-neutral-600"
            bgColorClass="bg-neutral-50 dark:bg-neutral-900/30"
            className="py-16"
          />
        ) : (
          displayData.map((row, idx) => (
            <ActivityRow
              key={idx}
              {...row}
              isLast={idx === displayData.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
