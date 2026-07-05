import React from 'react';
import { RoomDataBlock } from './RoomDataBlock';

interface RoomRewardSectionProps {
  rewardPool: string;
  rewardPoolIdr: string;
  creator: {
    username: string;
    initials: string;
    role: string;
  };
}

export function RoomRewardSection({ rewardPool, rewardPoolIdr, creator }: RoomRewardSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-neutral-8 dark:text-neutral-4 mb-2">
          <span className="text-sm font-medium whitespace-nowrap">Reward Pool</span>
          <i className="fi fi-rr-info text-xs mt-0.5 text-neutral-6 cursor-pointer" title="The total amount of reward tokens available in this room." />
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-semibold text-black dark:text-neutral-1">{rewardPool}</span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-sm font-medium text-neutral-8 dark:text-neutral-6">Equal to</span>
            <span className="text-sm font-semibold text-[#9333ea] bg-[#f3e8ff] dark:bg-purple-950/40 dark:text-purple-300 px-2 py-0.5 rounded-md">
              {rewardPoolIdr}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm select-none">
          {creator.initials}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-black dark:text-neutral-1 leading-tight">{creator.username}</span>
          <span className="text-xs text-neutral-7 dark:text-neutral-6">{creator.role}</span>
        </div>
      </div>
    </div>
  );
}
