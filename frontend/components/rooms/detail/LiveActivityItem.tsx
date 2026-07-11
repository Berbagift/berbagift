import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface LiveActivityItemProps {
  activity: {
    username: string;
    initials: string;
    action: string;
    timestamp: string;
  };
}

/**
 * Format a timestamp for display.
 * If the timestamp is an ISO date string, compute a relative time.
 * Otherwise, pass through the raw value (backward compat with legacy "30s ago" format).
 */
function formatTimestamp(timestamp: string): string {
  // ISO 8601 check — if it contains 'T' or 'Z', treat as date
  if (timestamp.includes('T') || timestamp.includes('Z')) {
    try {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return formatDistanceToNow(date, { addSuffix: false });
      }
    } catch {
      // fall through
    }
  }
  return timestamp;
}

/**
 * Capitalize action text for display ("joined" → "Joined", "left" → "Leave").
 */
function formatAction(action: string): string {
  if (action.toLowerCase() === 'left') return 'Leave';
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export function LiveActivityItem({ activity }: LiveActivityItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-secondary-500 font-semibold text-xl flex-shrink-0 select-none">
          {activity.initials}
        </div>
        <span className="text-base font-medium text-black dark:text-neutral-1">{activity.username}</span>
      </div>
      <div className="text-right">
        <span className="text-base text-neutral-8 dark:text-neutral-4 font-medium">
          {formatAction(activity.action)} {formatTimestamp(activity.timestamp)}
        </span>
      </div>
    </div>
  );
}
