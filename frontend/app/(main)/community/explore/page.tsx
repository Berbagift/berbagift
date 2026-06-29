'use client';

import { useState, useMemo } from 'react';
import { RoomFilterTabs } from '@/components/rooms/RoomFilterTabs';
import { RoomSearch } from '@/components/rooms/RoomSearch';
import { RoomGrid } from '@/components/rooms/RoomGrid';
import { RoomCard } from '@/components/rooms/RoomCard';
import { EmptyState } from '@/components/rooms/EmptyState';
import { useRouter } from 'next/navigation';
import { useRooms } from '@/lib/api/queries';

export default function ExploreRoomsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All Rooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedRoomIds, setSavedRoomIds] = useState<string[]>([]);

  // Fetch rooms reactively via TanStack Query
  const { data: rooms = [], isLoading } = useRooms({
    status: activeFilter,
    search: searchQuery,
  });

  // Calculate local client saved state changes overlaying query results
  const processedRooms = useMemo(() => {
    return rooms.map((room) => ({
      ...room,
      isSaved: savedRoomIds.includes(room.id) ? !room.isSaved : room.isSaved,
    }));
  }, [rooms, savedRoomIds]);

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
      <div className="flex flex-col gap-6 p-8 border-b border-border bg-background sticky top-0 z-10">
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
      <div className="flex-1 p-8 bg-background">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
          </div>
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
