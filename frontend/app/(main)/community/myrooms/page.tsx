'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MyRoom, MyRoomCard } from '@/components/rooms/MyRoomCard';
import { RoomSearch } from '@/components/rooms/RoomSearch';
import { RoomGrid } from '@/components/rooms/RoomGrid';

const MOCK_MY_ROOMS: MyRoom[] = [
  {
    id: 'myroom-1',
    title: 'Mau Bagi Hadiah 😊',
    description: 'Buat 3 orang yang paling cepet mencet tombol claim bisa menang, oke gas!',
    rewardPool: '100 XLM',
    winners: 3,
    participants: ['NB', 'AF', 'MH', 'EG', 'FH'],
    joined: 0,
    maxParticipants: 10,
    status: 'Active',
    dateText: '1 June 2026',
  },
  {
    id: 'myroom-2',
    title: 'Share More, Give More',
    description: '150 XLM for 5 fastest user, lets gowww!!!! make sure your ready',
    rewardPool: '150 XLM',
    winners: 5,
    participants: ['NB', 'AF', 'MH', 'EG', 'FH'],
    joined: 15,
    maxParticipants: 15,
    status: 'Completed',
    dateText: '31 May 2026',
  },
  {
    id: 'myroom-3',
    title: 'Lorem ipsum',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,',
    rewardPool: '150 XLM',
    winners: 5,
    participants: ['NB', 'AF', 'MH', 'EG', 'FH'],
    joined: 15,
    maxParticipants: 15,
    status: 'Draft',
    dateText: '31 May 2026',
  },
];

export default function MyRoomsPage() {
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter list of rooms based on search query
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_MY_ROOMS;
    const query = searchQuery.toLowerCase();
    return MOCK_MY_ROOMS.filter(
      (room) =>
        room.title.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col bg-background pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            />
          ))}
        </RoomGrid>
      </div>
    </div>
  );
}
