'use client';

import { useParams, useRouter } from 'next/navigation';
import { RoomStatsCard } from '@/components/rooms/detail/RoomStatsCard';
import { ClaimInstructionSection } from '@/components/rooms/detail/ClaimInstructionSection';
import { LiveActivityCard } from '@/components/rooms/detail/LiveActivityCard';
import { useRoomDetail, useClaimReward } from '@/lib/api/queries';
import { getErrorMessage } from '@/lib/api/client';

export default function RoomDetailPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();

  const { data: roomData, isLoading } = useRoomDetail(roomId);
  const claimMutation = useClaimReward();

  const handleClaim = () => {
    claimMutation.mutate(roomId, {
      onSuccess: (res) => {
        alert(res.txHash ? `Claim successful! Tx Hash: ${res.txHash}` : "Claim successful!");
      },
      onError: (err) => {
        alert(getErrorMessage(err, "Claim failed. Please try again."));
      }
    });
  };

  const handleLeave = () => {
    router.push('/community/explore');
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
              onClaim={handleClaim} 
              onLeave={handleLeave} 
            />
            <ClaimInstructionSection />
          </div>

          {/* Sidebar (Right) */}
          <div className="w-full h-full relative">
            <div className="sticky top-24 h-[calc(100vh-140px)]">
              <LiveActivityCard activities={roomData.activities} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
