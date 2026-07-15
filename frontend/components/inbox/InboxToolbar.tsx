import React from 'react';

interface InboxToolbarProps {
  onMarkAllAsRead: () => void;
  startIndex: number;
  endIndex: number;
  totalCount: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  disabledPrev?: boolean;
  disabledNext?: boolean;
}

export function InboxToolbar({
  onMarkAllAsRead,
  startIndex,
  endIndex,
  totalCount,
  onPrevPage,
  onNextPage,
  disabledPrev = true,
  disabledNext = true,
}: InboxToolbarProps) {
  return (
    <div className="px-4 md:px-6 py-3.5 md:py-4 flex items-center justify-between border-b border-border bg-white dark:bg-card">
      <h2 className="text-xs md:text-sm font-semibold text-black dark:text-neutral-1 whitespace-nowrap truncate max-w-[110px] sm:max-w-none">
        Check Your Mailbox Here
      </h2>
      <div className="flex items-center gap-2.5 md:gap-4 flex-shrink-0">
        {/* Mark All As Read Text Button */}
        <button
          onClick={onMarkAllAsRead}
          className="flex items-center gap-1.5 md:gap-2 text-neutral-8 dark:text-neutral-3 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[15px] h-[15px] md:w-[18px] md:h-[18px] text-neutral-8 dark:text-neutral-3 mt-[1px] flex-shrink-0"
          >
            <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
            <polyline points="9 11 12 14 18 8"></polyline>
          </svg>
          <span className="text-[10px] md:text-xs lg:text-sm font-medium whitespace-nowrap">Mark all as read</span>
        </button>
        
        {/* Divider */}
        <div className="w-px h-4 bg-neutral-4 dark:bg-neutral-10 flex-shrink-0" />
        
        {/* Pagination text */}
        <span className="text-[10px] md:text-xs lg:text-sm text-neutral-8 dark:text-neutral-3 font-normal whitespace-nowrap">
          {startIndex} - {endIndex} of {totalCount}
        </span>
        
        {/* Pagination buttons */}
        <div className="flex items-center gap-1 md:gap-2 ml-0.5 flex-shrink-0">
          <button
            onClick={onPrevPage}
            disabled={disabledPrev}
            className="p-1 text-neutral-7 dark:text-neutral-6 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="First/Previous page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 md:w-3.5 md:h-3.5 mt-[1px]"
            >
              <line x1="4" y1="4" x2="4" y2="20"></line>
              <polyline points="20 20 12 12 20 4"></polyline>
            </svg>
          </button>
          <button
            onClick={onNextPage}
            disabled={disabledNext}
            className="p-1 text-neutral-7 dark:text-neutral-6 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Last/Next page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3 h-3 md:w-3.5 md:h-3.5 mt-[1px]"
            >
              <polyline points="4 4 12 12 4 20"></polyline>
              <line x1="20" y1="4" x2="20" y2="20"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


