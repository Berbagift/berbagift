import React from 'react';
import { RoomRewardSection } from './RoomRewardSection';
import { RoomDataBlock } from './RoomDataBlock';
import { RoomStatusBanner } from './RoomStatusBanner';
import { RoomActionButtons } from './RoomActionButtons';
import { useCountdown } from '@/hooks/use-countdown';
import { Room, Participant } from '@/lib/api/types';

interface RoomStatsCardProps {
  room: Room;
  participants: Participant[];
  onClaim: () => void;
  onLeave: () => void;
  onJoin?: () => void;
  isJoining?: boolean;
  isClaiming?: boolean;
  isLeaving?: boolean;
  isClaimed?: boolean;
}

export function RoomStatsCard({ room, participants, onClaim, onLeave, onJoin, isJoining, isClaiming, isLeaving, isClaimed }: RoomStatsCardProps) {
  // Calculate remaining seconds if claim_session_start exists
  const now = Math.floor(Date.now() / 1000);
  const claimStart = room.claim_session_start ? Number(room.claim_session_start) : now + (room.claimCountdown ?? 0);
  const diff = Math.max(0, claimStart - now);

  const { formattedTime, isFinished } = useCountdown(diff);

  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 sm:p-8 w-full shadow-none">
      <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
        {/* Reward Pool & Creator */}
        <div className="w-full md:w-[260px] xl:w-[280px] flex-shrink-0 md:border-r md:border-border md:pr-6">
          <RoomRewardSection
            rewardPool={room.rewardPool}
            rewardPoolIdr={room.rewardPoolIdr ?? 'Rp 0'}
            creator={room.creator}
          />
        </div>

        {/* Stats Grid and Actions */}
        <div className="flex-1 flex flex-col justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
            <RoomDataBlock icon="fi fi-rr-users" label="Total Winners">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold text-black dark:text-neutral-1">
                  {Array.isArray(room.winners) ? room.winners.length : room.winners}
                </span>
                <span className="text-base font-semibold text-black dark:text-neutral-1">Winners</span>
              </div>
            </RoomDataBlock>

            {/* Vertical Divider */}
            <div className="hidden sm:block w-px bg-border self-stretch" />

            <RoomDataBlock icon="fi fi-rr-user-add" label="Total Participants">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold text-black dark:text-neutral-1">{room.joined}/{room.maxParticipants}</span>
                <span className="text-base font-semibold text-black dark:text-neutral-1">In Room</span>
              </div>
              {participants.length > 0 && (
                <div className="flex items-center mt-2">
                  {participants.slice(0, 4).map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary-100 text-secondary-700 text-[10px] font-bold border border-white dark:border-card"
                      style={{ marginLeft: i !== 0 ? '-10px' : '0', zIndex: 4 - i }}
                      title={p.username}
                    >
                      {p.initials}
                    </div>
                  ))}
                  {participants.length > 4 && (
                    <div
                      className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-600 text-[10px] font-bold border border-white dark:border-card"
                      style={{ marginLeft: '-10px', zIndex: 0 }}
                    >
                      +{participants.length - 4}
                    </div>
                  )}
                </div>
              )}
            </RoomDataBlock>

            {/* Vertical Divider */}
            <div className="hidden sm:block w-px bg-border self-stretch" />

            <RoomDataBlock icon="fi fi-rr-time-fast" label="Claim starts in">
              <div>
                <span className="text-3xl font-semibold text-warning-500">{isFinished ? 'Now' : formattedTime}</span>
              </div>
            </RoomDataBlock>
          </div>

          <div className="flex flex-col gap-5">
            <RoomStatusBanner status={room.status} />
            <RoomActionButtons
              status={room.status}
              onClaim={onClaim}
              onLeave={onLeave}
              onJoin={onJoin}
              isJoining={isJoining}
              isClaiming={isClaiming}
              isLeaving={isLeaving}
              isSessionStarted={isFinished}
              isOwner={room.is_owner}
              isClaimed={isClaimed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
