import React from 'react';

interface RecipientChipProps {
  initials: string;
  username: string;
  onRemove?: () => void;
}

export function RecipientChip({ initials, username, onRemove }: RecipientChipProps) {
  // Ensure the username doesn't have double '@' symbols
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white dark:bg-card w-fit cursor-default hover:border-neutral-6 transition-colors">
      <div className="w-6 h-6 rounded-full bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center text-[10px] font-semibold shrink-0">
        {initials.toUpperCase()}
      </div>
      <span className="text-sm font-medium text-black dark:text-neutral-1">@{cleanUsername}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-4 h-4 flex items-center justify-center text-neutral-7 dark:text-neutral-6 hover:text-neutral-9 transition-colors rounded-full hover:bg-neutral-3"
        >
          <i className="fi fi-rr-cross-small text-xs"></i>
        </button>
      )}
    </div>
  );
}
