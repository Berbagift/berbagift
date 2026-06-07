import React from 'react';

interface LiveActivityItemProps {
  activity: {
    id: string;
    username: string;
    avatar: string;
    action: string;
    timestamp: string;
  };
}

export function LiveActivityItem({ activity }: LiveActivityItemProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs flex-shrink-0">
          {activity.avatar}
        </div>
        <span className="text-sm font-semibold text-black dark:text-neutral-1">{activity.username}</span>
      </div>
      <div className="flex items-center gap-2 text-right">
        <span className="text-sm text-neutral-8 dark:text-neutral-6">{activity.action}</span>
        <span className="text-sm text-neutral-7 dark:text-neutral-6">{activity.timestamp}</span>
      </div>
    </div>
  );
}
