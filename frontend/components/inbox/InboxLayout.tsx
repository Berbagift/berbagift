import React from 'react';
import { InboxToolbar } from './InboxToolbar';
import { InboxMailList } from './InboxMailList';
import { InboxMailPreview } from './InboxMailPreview';
import { InboxEmptyPreview } from './InboxEmptyPreview';
import { InboxMailItemData } from './InboxMailItem';

interface InboxLayoutProps {
  items: InboxMailItemData[];
  onMarkAllAsRead: () => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onToggleRead: (id: string, e: React.MouseEvent) => void;
  isLoading?: boolean;
}

export function InboxLayout({
  items,
  onMarkAllAsRead,
  selectedId,
  setSelectedId,
  onToggleRead,
  isLoading = false,
}: InboxLayoutProps) {
  const selectedItem = items.find((item) => item.id === selectedId);

  return (
    <div className="border-0 md:border border-border rounded-none md:rounded-md bg-transparent md:bg-white dark:md:bg-card flex flex-col md:overflow-hidden">
      {/* Toolbar */}
      <InboxToolbar
        onMarkAllAsRead={onMarkAllAsRead}
        startIndex={items.length > 0 ? 1 : 0}
        endIndex={items.length}
        totalCount={items.length}
        disabledPrev={true}
        disabledNext={true}
      />

      {/* Content Area */}
      <div className="flex flex-col md:flex-row flex-1 min-h-[500px] md:min-h-[600px] divide-y md:divide-y-0 md:divide-x divide-neutral-4 dark:divide-neutral-10">
        {/* Left Side: Mail List */}
        <div
          className={`w-full md:w-[48%] lg:w-[45%] flex flex-col ${
            selectedId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <InboxMailList
            items={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggleRead={onToggleRead}
            isLoading={isLoading}
          />
        </div>


        {/* Right Side: Mail Preview */}
        <div
          className={`w-full md:w-[52%] lg:w-[55%] flex flex-col bg-neutral-2/10 dark:bg-neutral-11/10 ${
            selectedId ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedItem ? (
            <InboxMailPreview
              item={selectedItem}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <InboxEmptyPreview />
          )}
        </div>
      </div>
    </div>
  );
}

