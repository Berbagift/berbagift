import React from 'react';
import { RoomRewardSection } from './RoomRewardSection';
import { RoomDataBlock } from './RoomDataBlock';
import { RoomStatusBanner } from './RoomStatusBanner';
import { RoomActionButtons } from './RoomActionButtons';
import { useCountdown } from '@/hooks/use-countdown';
import { Room } from '@/lib/api/types';

interface RoomStatsCardProps {
  room: Room;
  onClaim: () => void;
  onLeave: () => void;
}

export function RoomStatsCard({ room, onClaim, onLeave }: RoomStatsCardProps) {
  const { formattedTime } = useCountdown(room.claimCountdown ?? 0);

  return (
    <div className="bg-white dark:bg-card border border-border rounded-md p-4 sm:p-5 lg:p-6 w-full shadow-sm">
      <div className="flex flex-col md:flex-row gap-5 sm:gap-6 lg:gap-8">
        {/* Reward Pool & Creator */}
        <div className="w-full md:w-[260px] xl:w-[280px] flex-shrink-0">
            <RoomRewardSection
              rewardPool={room.rewardPool}
              rewardPoolIdr={room.rewardPoolIdr ?? 'Rp 0'}
              creator={room.creator}
            />
        </div>

        {/* Vertical Divider (Desktop only) */}
        <div className="hidden md:block w-px bg-neutral-3 self-stretch" />

        {/* Stats Grid and Actions */}
        <div className="flex-1 flex flex-col justify-between gap-6 sm:gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <RoomDataBlock icon="fi fi-rr-users" label="Total Winners">
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-black dark:text-neutral-1">{room.winners}</span>
                <span className="text-sm font-semibold text-black dark:text-neutral-1">Winners</span>
              </div>
            </RoomDataBlock>

            <RoomDataBlock icon="fi fi-rr-user-add" label="Total Participants">
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-black dark:text-neutral-1">{room.joined}/{room.maxParticipants}</span>
                <span className="text-sm font-semibold text-black dark:text-neutral-1">In Room</span>
              </div>
            </RoomDataBlock>

            <RoomDataBlock icon="fi fi-rr-time-fast" label="Claim starts in">
              <div className="mt-1">
                <span className="text-xl font-semibold text-accent-orange-500">{formattedTime}</span>
              </div>
            </RoomDataBlock>
          </div>

          <div className="flex flex-col gap-3">
            <RoomStatusBanner status={room.status} />
            <RoomActionButtons
              status={room.status}
              onClaim={onClaim}
              onLeave={onLeave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
