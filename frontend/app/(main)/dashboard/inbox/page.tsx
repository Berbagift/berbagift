'use client';

import React, { useState } from 'react';
import { InboxLayout } from '@/components/inbox/InboxLayout';
import {
  useNotifications,
  useUpdateNotification,
  useMarkAllNotificationsRead,
} from '@/lib/api/queries/notifications';

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<string>('All Notification');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch from API using the active tab as category filter
  const { data: notificationsData, isLoading } = useNotifications(activeTab);
  const notifications = notificationsData?.items || [];
  const counts = notificationsData?.counts || {};

  const updateMutation = useUpdateNotification();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const TABS = [
    { label: 'All Notification', icon: 'fi-rr-bell' },
    { label: 'Rewards', icon: 'fi-rr-gift' },
    { label: 'Rooms', icon: 'fi-rr-apps-add' },
    { label: 'Transfer', icon: 'fi-rr-paper-plane' },
    { label: 'Swap', icon: 'fi-rr-refresh' },
    { label: 'System', icon: 'fi-rr-settings' },
  ];

  // Helper to count notifications by category from API response
  const getTabCount = (label: string) => {
    return counts[label] || 0;
  };

  const handleTabChange = (tabLabel: string) => {
    setActiveTab(tabLabel);
    setSelectedId(null); // Reset selection when filtering
  };

  const handleMarkAllAsRead = () => {
    // Pass specific category if a tab is selected (other than 'All Notification')
    const category = activeTab === 'All Notification' ? undefined : activeTab;
    markAllReadMutation.mutate(category);
  };

  // Toggle read status of a specific item
  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = notifications.find((n) => n.id === id);
    if (item) {
      updateMutation.mutate({ id, updates: { read: !item.read } });
    }
  };

  // If selecting an item, we also mark it as read for realistic UX
  const handleSelectNotification = (id: string | null) => {
    setSelectedId(id);
    if (id) {
      const item = notifications.find((n) => n.id === id);
      if (item && !item.read) {
        updateMutation.mutate({ id, updates: { read: true } });
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Category Tabs */}
      <div className="flex items-center w-full overflow-x-auto border border-border rounded-md bg-white dark:bg-card sidebar-scrollbar">
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.label;
          return (
            <React.Fragment key={idx}>
              <div className="flex-1 min-w-[160px]">
                <button
                  onClick={() => handleTabChange(tab.label)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#22c55e]'
                      : 'text-neutral-7 dark:text-neutral-6 hover:text-black dark:hover:text-neutral-1'
                  }`}
                >
                  <i className={`fi ${tab.icon} mt-[2px]`} />
                  {tab.label}
                  <span
                    className={`rounded-full w-6 h-6 flex items-center justify-center text-xs ml-1 font-semibold ${
                      isActive
                        ? 'bg-emerald-50 text-[#22c55e] dark:bg-emerald-950/20'
                        : 'bg-neutral-3 text-black dark:text-neutral-1'
                    }`}
                  >
                    {getTabCount(tab.label)}
                  </span>
                </button>
              </div>
              {/* Divider */}
              {idx < TABS.length - 1 && (
                <div className="w-px h-8 bg-neutral-4 dark:bg-neutral-10 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Inbox Layout Container */}
      <InboxLayout
        items={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        selectedId={selectedId}
        setSelectedId={handleSelectNotification}
        onToggleRead={handleToggleRead}
        isLoading={isLoading}
      />
    </div>
  );
}
