'use client';

import { useState, useEffect } from 'react';
import { RoomFilterTabs } from '@/components/rooms/RoomFilterTabs';
import { RoomSearch } from '@/components/rooms/RoomSearch';
import { RoomGrid } from '@/components/rooms/RoomGrid';
import { RoomCard } from '@/components/rooms/RoomCard';
import { EmptyState } from '@/components/rooms/EmptyState';
import { useRouter } from 'next/navigation';
import { useExploreRooms } from '@/lib/api/queries';
import { getAuthToken } from '@/lib/auth';

const RoomCardSkeleton = () => (
  <div className="flex flex-col bg-emerald-50/50 dark:bg-emerald-900/10 border border-border rounded-xl p-6 h-[380px] animate-pulse">
    {/* Header */}
    <div className="flex flex-col gap-2 mb-4">
      <div className="h-6 w-3/4 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
      <div className="h-4 w-full bg-emerald-100/80 dark:bg-emerald-800/30 rounded mt-1" />
      <div className="h-4 w-5/6 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
    </div>

    {/* Creator Info */}
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-emerald-100/80 dark:bg-emerald-800/30 flex-shrink-0" />
      <div className="flex flex-col gap-1 w-full">
        <div className="h-4 w-24 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
        <div className="h-3 w-16 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
      </div>
    </div>

    {/* Stats */}
    <div className="h-12 w-full bg-emerald-100/80 dark:bg-emerald-800/30 rounded mb-4" />

    {/* Participant Stack */}
    <div className="h-8 w-1/2 bg-emerald-100/80 dark:bg-emerald-800/30 rounded mb-4" />

    <div className="mt-auto">
      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <div className="h-10 w-full bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
        <div className="h-10 w-12 bg-emerald-100/80 dark:bg-emerald-800/30 rounded flex-shrink-0" />
      </div>

      {/* Footer Status */}
      <div className="pt-4 border-t border-border">
        <div className="h-4 w-1/3 bg-emerald-100/80 dark:bg-emerald-800/30 rounded" />
      </div>
    </div>
  </div>
);

export default function ExploreRoomsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All Rooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedRoomIds, setSavedRoomIds] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getAuthToken() || null);
  }, []);

  // Fetch rooms reactively via TanStack Query
  const { data: rooms = [], isLoading } = useExploreRooms(token, {
    status: activeFilter,
    search: searchQuery,
  });

  // Calculate local client saved state changes overlaying query results
  const processedRooms = rooms.map((room) => ({
    ...room,
    isSaved: savedRoomIds.includes(room.id) ? !room.isSaved : room.isSaved,
  }));

  const handleSaveRoom = (id: string) => {
    setSavedRoomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleJoinRoom = (id: string) => {
    router.push(`/community/explore/join/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Section */}
      <div className="flex flex-col gap-6   bg-background sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
          <div className="flex flex-col max-w-3xl xl:max-w-none">
            <h1 className="text-3xl font-medium text-black dark:text-neutral-1 mb-2">
              Find Your Next Reward Room 🎁
            </h1>
            <p className="text-xl font-medium text-neutral-8 dark:text-neutral-4 xl:whitespace-nowrap">
              Discover live THR events, creator giveaways, and community reward rooms in realtime.
            </p>
          </div>
          <div className="flex-shrink-0 mt-1">
            <RoomSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center pt-2">
          <RoomFilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 mt-6 bg-background">
        {isLoading ? (
          <RoomGrid>
            {[...Array(8)].map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </RoomGrid>
        ) : processedRooms.length > 0 ? (
          <RoomGrid>
            {processedRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSave={handleSaveRoom}
                onJoin={handleJoinRoom}
              />
            ))}
          </RoomGrid>
        ) : (
          <EmptyState
            title={
              searchQuery
                ? `No results for "${searchQuery}"`
                : "No rooms available"
            }
          />
        )}
      </div>
    </div>
  );
}
