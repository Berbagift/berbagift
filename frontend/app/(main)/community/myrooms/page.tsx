'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MyRoomCard } from '@/components/rooms/MyRoomCard';
import { RoomSearch } from '@/components/rooms/RoomSearch';
import { RoomGrid } from '@/components/rooms/RoomGrid';
import { useMyRooms } from '@/lib/api/queries';
import { getAuthToken } from '@/lib/auth';
import { useWalletStore } from '@/hooks/use-wallet-state';
import { getRoomParticipantsCount } from '@/lib/stellar/multi-room';

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

export default function MyRoomsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const { publicKey } = useWalletStore();
  const [liveParticipantCounts, setLiveParticipantCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setToken(getAuthToken() || null);
  }, []);

  const { data: rooms = [], isLoading: isRoomsLoading } = useMyRooms(token);

  useEffect(() => {
    if (rooms.length > 0 && publicKey) {
      rooms.forEach(async (room) => {
        const roomIdNum = typeof room.room_id === 'number' ? room.room_id : parseInt(room.id as string, 10);
        if (!isNaN(roomIdNum)) {
          const count = await getRoomParticipantsCount(roomIdNum, publicKey);
          setLiveParticipantCounts((prev) => ({ ...prev, [room.id]: count }));
        }
      });
    }
  }, [rooms, publicKey]);

  const myRooms = rooms
    .map((room) => {
      let mappedStatus: 'Active' | 'Completed' | 'Draft' = 'Active';
      if (room.status === 'Completed') {
        mappedStatus = 'Completed';
      } else if (room.status === 'Draft') {
        mappedStatus = 'Draft';
      }

      return {
        id: room.id,
        title: room.title,
        description: room.description,
        rewardPool: room.rewardPool || room.reward || '0 XLM', // Use raw DB reward if available
        winners: room.winners,
        participants: room.participants || [],
        joined: liveParticipantCounts[room.id] !== undefined ? liveParticipantCounts[room.id] : (room.joined || 0),
        maxParticipants: room.maxParticipants || room.capacity || 10,
        status: mappedStatus,
        dateText: room.statusText || 'N/A',
      };
    });

  const isLoading = isRoomsLoading;

  const handleEdit = (id: string) => {
    alert(`Editing room ${id}`);
  };

  const handleShare = (id: string) => {
    alert(`Sharing link for room ${id}`);
  };

  const handleViewResult = (id: string) => {
    alert(`Viewing results for room ${id}`);
  };

  const handleDelete = (id: string) => {
    alert(`Deleting room ${id}`);
  };

  const handleJoin = (id: string) => {
    window.location.href = `/community/explore/join/${id}`;
  };

  // Filter list of rooms based on search query
  const query = searchQuery.toLowerCase();
  const filteredRooms = !searchQuery.trim()
    ? myRooms
    : myRooms.filter(
        (room) =>
          room.title.toLowerCase().includes(query) ||
          room.description.toLowerCase().includes(query)
      );

  if (isLoading) {
    return (
      <div className="flex flex-col bg-background pb-10">
        <div className="flex flex-col gap-6 pb-6 border-b border-border bg-background mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col max-w-3xl xl:max-w-none">
              <h1 className="text-3xl font-medium text-black dark:text-neutral-1 mb-2">
                Create and Manage Your Rooms
              </h1>
              <p className="text-xl w-full font-medium text-neutral-8 dark:text-neutral-4 xl:whitespace-nowrap">
                Start a new giveaway room or manage the rooms you&apos;ve already created from one place.
              </p>
            </div>
            <div className="flex-shrink-0 mt-1">
              <div className="h-10 w-64 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex-grow bg-background">
          <RoomGrid>
            <div className="flex flex-col items-center justify-center bg-emerald-50/30 dark:bg-emerald-900/5 border-2 border-dashed border-emerald-100 dark:border-emerald-800/50 rounded-xl p-6 h-full min-h-[373px] animate-pulse">
            </div>
            {[...Array(7)].map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </RoomGrid>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background pb-10">
      {/* Header Section (Matching style of Explore Rooms, but without filter chips) */}
      <div className="flex flex-col gap-6 pb-6 border-b border-border bg-background mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col max-w-3xl xl:max-w-none">
            <h1 className="text-3xl font-medium text-black dark:text-neutral-1 mb-2">
              Create and Manage Your Rooms
            </h1>
            <p className="text-xl w-full font-medium text-neutral-8 dark:text-neutral-4 xl:whitespace-nowrap">
              Start a new giveaway room or manage the rooms you&apos;ve already created from one place.
            </p>
          </div>
          <div className="flex-shrink-0 mt-1">
            <RoomSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </div>

      {/* Main Content Area using RoomGrid wrapper */}
      <div className="flex-grow bg-background">
        <RoomGrid>
          {/* Create Room Placeholder Card */}
          <Link
            href="/community/create-room"
            className="flex flex-col items-center justify-center bg-[#FCFCFC]/30 dark:bg-neutral-900/10 hover:bg-neutral-50 dark:hover:bg-neutral-900/20 border-2 border-dashed border-[#D9D9D9] dark:border-neutral-800 rounded-xl p-6 h-full min-h-[373px] transition-all duration-200 cursor-pointer group"
          >
            <div className="flex flex-col items-center gap-3">
              <i className="fi fi-rr-apps-add text-[36px] text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
              <span className="text-lg font-semibold text-black dark:text-neutral-1 group-hover:opacity-85 transition-opacity">
                Create Room
              </span>
            </div>
          </Link>

          {/* List of rooms */}
          {filteredRooms.map((room) => (
            <MyRoomCard
              key={room.id}
              room={room}
              onEdit={handleEdit}
              onShare={handleShare}
              onViewResult={handleViewResult}
              onDelete={handleDelete}
              onJoin={handleJoin}
            />
          ))}
        </RoomGrid>
      </div>
    </div>
  );
}
