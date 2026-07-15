import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface LiveActivityItemProps {
  activity: {
    username: string;
    initials: string;
    action: string;
    timestamp: string;
    message?: string;
  };
}

/**
 * Format a timestamp for display.
 * If the timestamp is an ISO date string, compute a relative time.
 * Otherwise, pass through the raw value (backward compat with legacy "30s ago" format).
 */
function formatTimestamp(timestamp: string): string {
  if (timestamp.includes('T') || timestamp.includes('Z')) {
    try {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
    } catch {
      // fall through
    }
  }
  return timestamp;
}

const actionConfig: Record<string, { color: string; bg: string }> = {
  joined:    { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  left:      { color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950' },
  claimed:   { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950' },
  completed: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950' },
};

export function LiveActivityItem({ activity }: LiveActivityItemProps) {
  const config = actionConfig[activity.action] ?? actionConfig.joined;
  const displayText = activity.message || activity.action;

  return (
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 select-none ${config.bg} ${config.color}`}>
        {activity.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-black dark:text-neutral-1 leading-relaxed">
          {displayText}
        </p>
        <p className="text-xs text-neutral-8 dark:text-neutral-6 mt-0.5">
          {formatTimestamp(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}
