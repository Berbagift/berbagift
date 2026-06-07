import React from 'react';
import { LiveActivityItem } from './LiveActivityItem';

interface LiveActivityCardProps {
  activities: Array<{
    id: string;
    username: string;
    avatar: string;
    action: string;
    timestamp: string;
  }>;
}

export function LiveActivityCard({ activities }: LiveActivityCardProps) {
  return (
    <div className="bg-white dark:bg-card border border-neutral-4 dark:border-border rounded-md p-6 shadow-sm flex flex-col h-full max-h-[800px]">
      <h3 className="text-xl font-semibold text-black dark:text-neutral-1 mb-4">Live Activity</h3>
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        {activities.map((activity) => (
          <LiveActivityItem key={activity.id} activity={activity} />
        ))}
        {activities.length === 0 && (
          <div className="text-center text-neutral-7 dark:text-neutral-6 py-8">No activity yet.</div>
        )}
      </div>
    </div>
  );
}
