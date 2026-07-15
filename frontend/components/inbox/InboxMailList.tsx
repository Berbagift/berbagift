import React from 'react';
import { InboxMailItem, InboxMailItemData } from './InboxMailItem';

interface InboxMailListProps {
  items: InboxMailItemData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleRead: (id: string, e: React.MouseEvent) => void;
  isLoading?: boolean;
}

export function InboxMailList({
  items,
  selectedId,
  onSelect,
  onToggleRead,
  isLoading = false,
}: InboxMailListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden divide-y divide-neutral-4 dark:divide-neutral-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-5 animate-pulse border-b border-neutral-4 dark:border-neutral-10 last:border-b-0">
            <div className="w-4 h-4 rounded bg-neutral-3 dark:bg-neutral-9 flex-shrink-0 mt-[3px]" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="h-4 bg-neutral-3 dark:bg-neutral-9 rounded w-1/3" />
                <div className="h-3 bg-neutral-3 dark:bg-neutral-9 rounded w-12" />
              </div>
              <div className="h-3 bg-neutral-3 dark:bg-neutral-9 rounded w-5/6 mt-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-7 dark:text-neutral-6 flex-1 h-full min-h-[300px]">
        <i className="fi fi-rr-bell-slash text-2xl mb-2 opacity-60" />
        <p className="text-xs">No notifications in this category</p>
      </div>
    );
  }


  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-neutral-4 dark:divide-neutral-10 max-h-[600px] md:max-h-[700px]">

      {items.map((item) => (
        <InboxMailItem
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          isChecked={item.read}
          onSelect={() => onSelect(item.id)}
          onToggleChecked={(e) => onToggleRead(item.id, e)}
        />
      ))}
    </div>
  );
}

