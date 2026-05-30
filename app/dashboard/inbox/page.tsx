import React from 'react';
import { Button } from '@/components/ui/button';

export default function InboxPage() {
  const TABS = [
    { label: 'All Notification', count: 12, active: true, icon: 'fi-rr-bell' },
    { label: 'Rewards', count: 3, active: false, icon: 'fi-rr-gift' },
    { label: 'Rooms', count: 0, active: false, icon: 'fi-rr-apps-add' },
    { label: 'Transfer', count: 5, active: false, icon: 'fi-rr-paper-plane' },
    { label: 'System', count: 4, active: false, icon: 'fi-rr-settings' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Top Action Row */}
      <div className="flex justify-end">
        <Button variant="outline" className="h-10 rounded-md border-neutral-4 dark:border-border text-black dark:text-neutral-1 flex items-center gap-2">
          <i className="fi fi-rr-check mt-[2px]" />
          Mark all as read
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center w-full overflow-x-auto border border-neutral-4 dark:border-border rounded-md bg-white dark:bg-card sidebar-scrollbar">
        {TABS.map((tab, idx) => (
          <React.Fragment key={idx}>
            <div className="flex-1 min-w-[160px]">
              <button
                className={`w-full flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab.active
                    ? 'text-emerald-500'
                    : 'text-neutral-7 dark:text-neutral-6 hover:text-black dark:text-neutral-1'
                }`}
              >
                <i className={`fi ${tab.icon} mt-[2px]`} />
                {tab.label}
                <span className={`rounded-full w-6 h-6 flex items-center justify-center text-xs ml-1 font-semibold ${
                  tab.active ? 'bg-emerald-50 text-emerald-500' : 'bg-neutral-3 text-black dark:text-neutral-1'
                }`}>
                  {tab.count}
                </span>
              </button>
            </div>
            {/* Divider */}
            {idx < TABS.length - 1 && (
              <div className="w-px h-8 bg-neutral-4 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Inbox Content Area (Empty State) */}
      <div className="border border-neutral-4 dark:border-border rounded-md bg-white dark:bg-card py-24 min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-2 dark:bg-neutral-10 flex items-center justify-center mb-4">
          <i className="fi fi-rr-envelope-open text-3xl text-neutral-5 mt-[2px]" />
        </div>
        <h3 className="text-lg font-medium text-black dark:text-neutral-1 mb-1">You're all caught up</h3>
        <p className="text-neutral-7 dark:text-neutral-6 text-sm">No new notifications right now</p>
      </div>
    </div>
  );
}
