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
      <RoomDataBlock icon="fi fi-rr-info" label="Reward Pool">
        <span className="text-3xl font-semibold text-black dark:text-neutral-1">{rewardPool}</span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-sm font-medium text-neutral-8 dark:text-neutral-6">Equal to</span>
          <span className="text-sm font-semibold text-accent-purple-500 bg-accent-purple-50 px-2 py-0.5 rounded-md">
            {rewardPoolIdr}
          </span>
        </div>
      </RoomDataBlock>

      <div className="flex items-center gap-3 mt-2">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
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
