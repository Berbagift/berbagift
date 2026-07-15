import React, { useState } from 'react';
import { LiveActivityItem } from './LiveActivityItem';
import { LiveActivity } from '@/lib/api/types';

interface LiveActivityCardProps {
  activities: LiveActivity[];
}

export function LiveActivityCard({ activities }: LiveActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 lg:p-8 shadow-none flex flex-col h-full lg:max-h-[826px]">
      <div
        className="flex items-center justify-between cursor-pointer lg:cursor-default mb-6 lg:mb-8"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-semibold text-black dark:text-neutral-1">
          Live Activity {activities.length > 0 && <span className="lg:hidden text-neutral-6 text-sm font-normal ml-1">({activities.length})</span>}
        </h3>
        <button className="lg:hidden w-8 h-8 flex items-center justify-center text-neutral-7 dark:text-neutral-6 focus:outline-none min-w-[44px] min-h-[44px]">
          <i className={`fi fi-rr-angle-down transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <div className={`flex-1 overflow-y-auto pr-2 lg:pr-4 ${isExpanded ? 'block' : 'hidden lg:block'} lg:custom-scrollbar`}>
        <div className="flex flex-col gap-5">
          {activities.map((activity, i) => (
            <LiveActivityItem key={activity.id || i} activity={activity} />
          ))}
        </div>
        {activities.length === 0 && (
          <div className="text-center text-neutral-7 dark:text-neutral-6 py-8 text-base">No activity yet.</div>
        )}
      </div>
    </div>
  );
}
