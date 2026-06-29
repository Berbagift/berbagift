'use client';

import React, { useState, useMemo } from 'react';
import { ActivityTable } from '@/components/dashboard/activity-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActivities } from '@/lib/api/queries';

export default function AllActivityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: activities = [], isLoading } = useActivities();

  // Local filter for search query
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const query = searchQuery.toLowerCase();
    return activities.filter(
      (act) =>
        act.type.toLowerCase().includes(query) ||
        act.details.toLowerCase().includes(query) ||
        act.amount.toLowerCase().includes(query)
    );
  }, [activities, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Top Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-7 dark:text-neutral-6 mt-[2px]" />
          <Input 
            type="text" 
            placeholder="Search activity..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-md border-border bg-white dark:bg-card"
          />
        </div>
        <Button variant="outline" className="h-10 rounded-md border-border text-black dark:text-neutral-1 flex items-center gap-2">
          <i className="fi fi-rr-filter mt-[2px]" />
          Filter Type
        </Button>
      </div>

      {/* Table Container */}
      <div className="border border-border rounded-md p-5 bg-white dark:bg-card">
        <ActivityTable data={filteredActivities} />
      </div>
    </div>
  );
}
