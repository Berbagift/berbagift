'use client';

import React from 'react';
import { ActivityRow } from './activity-row';
import { StatusState } from '@/components/shared/status-state';
import { useActivities } from '@/lib/api/queries';
import { Activity } from '@/lib/api/types';

export interface ActivityTableProps {
  data?: Activity[];
}

export function ActivityTable({ data }: ActivityTableProps) {
  const { data: fetchedActivities = [], isLoading } = useActivities();

  const displayData = data !== undefined ? data : fetchedActivities.slice(0, 4);

  if (isLoading && data === undefined) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary-500"></div>
      </div>
    );
  }
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
