'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { roomService } from '@/services/room.service';
import { RoomStatsCard } from '@/components/rooms/detail/RoomStatsCard';
import { ClaimInstructionSection } from '@/components/rooms/detail/ClaimInstructionSection';
import { LiveActivityCard } from '@/components/rooms/detail/LiveActivityCard';

export default function RoomDetailPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [roomData, setRoomData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [detail, activity] = await Promise.all([
          roomService.getRoomDetail(roomId),
          roomService.getRoomActivity(roomId)
        ]);
        
        if (isMounted) {
          setRoomData(detail);
          setActivities(activity);
        }
      } catch (error) {
        console.error("Failed to fetch room detail:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (roomId) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [roomId]);

  const handleClaim = () => {
    console.log("Claim button clicked for room:", roomId);
    // Add real API interaction later
  };

  const handleLeave = () => {
    router.push('/dashboard/rooms');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-80px)] justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-80px)] p-8">
        <div className="text-center py-20 text-neutral-7 dark:text-neutral-6 font-medium">Room not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Page Content padding matches DashboardLayout standard */}
      <div className="p-4 sm:p-6 lg:p-0">
        
        {/* Header Section */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-black dark:text-neutral-1 mb-2 md:mb-4">
            {roomData.title}
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-neutral-8 dark:text-neutral-6 max-w-3xl">
            {roomData.description}
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[75%_25%] gap-6 lg:gap-8 items-stretch">
          
          {/* Main Content (Left) */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <RoomStatsCard 
              room={roomData} 
              onClaim={handleClaim} 
              onLeave={handleLeave} 
            />
            <ClaimInstructionSection />
          </div>

          {/* Sidebar (Right) */}
          <div className="w-full h-full relative">
            <div className="sticky top-24 h-[calc(100vh-140px)]">
              <LiveActivityCard activities={activities} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
