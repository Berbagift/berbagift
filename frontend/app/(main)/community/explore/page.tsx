'use client';

import { useState, useEffect, useMemo } from 'react';
import { Room, roomService } from '@/services/room.service';
import { RoomFilterTabs } from '@/components/rooms/RoomFilterTabs';
import { RoomSearch } from '@/components/rooms/RoomSearch';
import { RoomGrid } from '@/components/rooms/RoomGrid';
import { RoomCard } from '@/components/rooms/RoomCard';
import { EmptyState } from '@/components/rooms/EmptyState';
import { useRouter } from 'next/navigation';

export default function ExploreRoomsPage() {
  const router = useRouter();
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [activeFilter, setActiveFilter] = useState('All Rooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all rooms initially
  useEffect(() => {
    let isMounted = true;
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const data = await roomService.getRooms();
        if (isMounted) {
          setAllRooms(data);
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and search logic
  const filteredRooms = useMemo(() => {
    let result = allRooms;

    // Apply Filter Tab
    switch (activeFilter) {
      case 'Upcoming':
        result = result.filter(r => r.status === 'Upcoming');
        break;
      case 'High Rewards':
        result = result.filter(r => r.isHighReward);
        break;
      case 'Saved Rooms':
        result = result.filter(r => r.isSaved);
        break;
      case 'All Rooms':
      default:
        break;
    }

    // Apply Search Query
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (room) =>
          room.title.toLowerCase().includes(lowerQuery) ||
          room.description.toLowerCase().includes(lowerQuery) ||
          room.creator.username.toLowerCase().includes(lowerQuery)
      );
    }

    return result;
  }, [allRooms, activeFilter, searchQuery]);

  const handleSaveRoom = (id: string) => {
    setAllRooms(prev => prev.map(room =>
      room.id === id ? { ...room, isSaved: !room.isSaved } : room
    ));
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
        ) : filteredRooms.length > 0 ? (
          <RoomGrid>
            {filteredRooms.map((room) => (
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
