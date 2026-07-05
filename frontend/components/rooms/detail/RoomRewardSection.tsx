import React from 'react';

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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-neutral-8 dark:text-neutral-4">
          <span className="text-xl font-medium whitespace-nowrap">Reward Pool</span>
          <i className="fi fi-rr-info text-lg text-neutral-8 dark:text-neutral-6 cursor-pointer" title="The total amount of reward tokens available in this room." />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-4xl font-semibold text-black dark:text-neutral-1">{rewardPool}</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-medium text-neutral-8 dark:text-neutral-6">Equal to</span>
            <span className="text-xl font-medium text-accent-purple-500 bg-accent-purple-50 dark:bg-accent-purple-900/40 dark:text-accent-purple-300 px-3 py-1 rounded-lg">
              {rewardPoolIdr}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-secondary-500 font-semibold text-xl select-none">
          {creator.initials}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-black dark:text-neutral-1 leading-tight">{creator.username}</span>
          <span className="text-xs font-medium text-neutral-7 dark:text-neutral-6">{creator.role}</span>
        </div>
      </div>
    </div>
  );
}
