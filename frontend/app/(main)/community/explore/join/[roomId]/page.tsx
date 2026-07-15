'use client';

import { useParams, useRouter } from 'next/navigation';
import { RoomStatsCard } from '@/components/rooms/detail/RoomStatsCard';
import { ClaimInstructionSection } from '@/components/rooms/detail/ClaimInstructionSection';
import { LiveActivityCard } from '@/components/rooms/detail/LiveActivityCard';
import { useRoomDetail, useCheckClaimed, useRoomActivities, useRoomParticipants } from '@/lib/api/queries';
import { useClaimRewardWeb3 } from '@/hooks/use-claim-reward';
import { useLeaveRoomWeb3 } from '@/hooks/use-leave-room';
import { useJoinRoom } from '@/hooks/use-join-room';

import { useState, useEffect } from 'react';
import { getAuthToken } from '@/lib/auth';

const RoomDetailSkeleton = () => (
  <div className="flex flex-col p-4 sm:p-6 lg:p-0">
    <div className="flex flex-col gap-2 mb-2">
      <div className="h-8 w-1/3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded animate-pulse" />
      <div className="h-6 w-1/2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded animate-pulse mt-2" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_512px] gap-6 lg:gap-8 items-stretch mt-6">
      <div className="flex flex-col gap-6 lg:gap-8">
        <div className="h-64 w-full bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl animate-pulse" />
        <div className="h-48 w-full bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl animate-pulse" />
      </div>
      <div className="w-full h-[calc(100vh-140px)] bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl animate-pulse" />
    </div>
  </div>
);

export default function RoomDetailPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getAuthToken() || null);
  }, []);

  const { data: roomData, isLoading: isLoading } = useRoomDetail(roomId, token);
  const { data: claimedData } = useCheckClaimed(roomId, token);
  const { data: liveActivities = [] } = useRoomActivities(roomId);
  const { data: roomParticipants = [] } = useRoomParticipants(roomId);
  const isClaimed = claimedData?.is_claimed ?? false;

  const { handleJoin, isJoining } = useJoinRoom(roomData);
  const { handleClaimWeb3, isClaiming } = useClaimRewardWeb3(roomData);
  const { handleLeaveWeb3, isLeaving } = useLeaveRoomWeb3(roomData);

  const isJoined = roomData?.is_joined ?? false;

  const handleClaim = () => {
    handleClaimWeb3();
  };

  const handleLeave = () => {
    handleLeaveWeb3();
  };

  if (isLoading) {
    return <RoomDetailSkeleton />;
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
        <div className="flex flex-col gap-2 mb-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-medium text-black dark:text-neutral-1">
            {roomData.title}
          </h1>
          <p className="text-base md:text-lg lg:text-xl font-medium text-neutral-8 dark:text-neutral-6 max-w-3xl">
            {roomData.description}
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_512px] gap-6 lg:gap-8 items-stretch">

          {/* Main Content (Left) */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <RoomStatsCard
              room={roomData}
              participants={roomParticipants}
              onClaim={handleClaim}
              onLeave={handleLeave}
              onJoin={isJoined ? undefined : handleJoin}
              isJoining={isJoining}
              isClaiming={isClaiming}
              isLeaving={isLeaving}
              isClaimed={isClaimed}
            />
            <ClaimInstructionSection />
          </div>

          {/* Sidebar (Right) */}
          <div className="w-full h-full relative">
            <div className="sticky top-24 h-[calc(100vh-140px)]">
              <LiveActivityCard activities={liveActivities} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
