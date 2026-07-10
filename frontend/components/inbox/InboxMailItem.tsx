import React from 'react';
import { cn } from '@/lib/utils';

export interface InboxMailItemData {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'Rewards' | 'Rooms' | 'Transfer' | 'System';
  read: boolean;
  details?: {
    amount?: string;
    username?: string;
    roomName?: string;
    timeLeft?: string;
    txHash?: string;
  };
}

interface InboxMailItemProps {
  item: InboxMailItemData;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onToggleChecked: (e: React.MouseEvent) => void;
}

export function InboxMailItem({
  item,
  isSelected,
  isChecked,
  onSelect,
  onToggleChecked,
}: InboxMailItemProps) {
  const { title, description, date, read: isRead } = item;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-start gap-4 p-5 transition-all duration-200 cursor-pointer border-b border-neutral-4 dark:border-neutral-10 last:border-b-0",
        isSelected
          ? "bg-neutral-3 dark:bg-neutral-10" 
          : "bg-white dark:bg-card hover:bg-neutral-2/50 dark:hover:bg-neutral-10/40"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onToggleChecked}
        className="flex-shrink-0 cursor-pointer focus:outline-none"
        aria-label={isChecked ? "Mark as unread" : "Mark as read"}
      >
        {isChecked ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-neutral-6 dark:text-neutral-4 mt-[3px]"
          >
            <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
            <polyline points="9 11 12 14 18 8"></polyline>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-neutral-5 dark:text-neutral-7 hover:text-[#22c55e] transition-colors mt-[3px]"
          >
            <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
          </svg>
        )}
      </button>

      {/* Item Body */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Title, Indicator, Date */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4
              className={cn(
                "text-xs md:text-sm font-heading truncate",
                isRead
                  ? "text-neutral-7 dark:text-neutral-6 font-medium"
                  : "text-black dark:text-neutral-1 font-semibold"
              )}
            >
              {title}
            </h4>
            
            {/* Orange Unread Dot */}
            {!isRead && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 self-center" />
            )}
          </div>
          
          <span className="text-xs text-neutral-7 dark:text-neutral-6 whitespace-nowrap self-start mt-[1px]">
            {date}
          </span>
        </div>

        {/* Description Preview */}
        <p
          className={cn(
            "text-xs line-clamp-2 leading-relaxed",
            isRead
              ? "text-neutral-7 dark:text-neutral-6"
              : "text-neutral-8 dark:text-neutral-4"
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
