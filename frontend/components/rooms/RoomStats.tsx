interface RoomStatsProps {
  rewardPool: string;
  winners: number;
}

export function RoomStats({ rewardPool, winners }: RoomStatsProps) {
  return (
    <div className="flex items-center w-full my-4">
      <div className="flex flex-col flex-1 gap-1">
        <span className="text-xs font-normal text-neutral-7 dark:text-neutral-6">Reward Pool</span>
        <span className="text-sm font-semibold text-accent-purple-500">{rewardPool}</span>
      </div>
      
      <div className="w-px h-8 bg-neutral-4 mx-4" />
      
      <div className="flex flex-col flex-1 gap-1">
        <span className="text-xs font-normal text-neutral-7 dark:text-neutral-6">Winners</span>
        <span className="text-sm font-semibold text-warning-500">{winners} Winners</span>
      </div>
    </div>
  );
}
