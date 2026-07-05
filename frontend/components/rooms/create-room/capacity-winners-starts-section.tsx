import React from 'react';

interface CapacityWinnersStartsSectionProps {
  roomCapacity: number | '';
  setRoomCapacity: (val: number | '') => void;
  totalWinners: number | '';
  setTotalWinners: (val: number | '') => void;
  claimSession: string;
  setClaimSession: (val: string) => void;
}

export function CapacityWinnersStartsSection({
  roomCapacity,
  setRoomCapacity,
  totalWinners,
  setTotalWinners,
  claimSession,
  setClaimSession,
}: CapacityWinnersStartsSectionProps) {
  return (
    <>
      {/* Room Capacity */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-black dark:text-neutral-1 font-medium text-base">
          Room Capacity
        </label>
        <div className="border border-border rounded-md px-3.5 py-2.5 bg-white dark:bg-card flex items-center focus-within:border-neutral-8 transition-colors">
          <input
            type="number"
            min={1}
            max={1000}
            value={roomCapacity}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setRoomCapacity('');
              } else {
                const num = parseInt(val, 10);
                if (!isNaN(num)) {
                  setRoomCapacity(Math.min(1000, Math.max(1, num)));
                }
              }
            }}
            placeholder="Choose your room capacity (max 1000)"
            className="w-full bg-transparent border-none outline-none text-base text-neutral-9 dark:text-neutral-2 placeholder:text-neutral-6"
          />
        </div>
      </div>

      {/* Total Winners & Claim Session Starts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        
        {/* Total Winners */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-black dark:text-neutral-1 font-medium text-base">
            Total Winners
          </label>
          <div className="border border-border rounded-md px-3.5 py-2.5 bg-white dark:bg-card flex items-center focus-within:border-neutral-8 transition-colors">
            <input
              type="number"
              min={1}
              value={totalWinners}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setTotalWinners('');
                } else {
                  const num = parseInt(val, 10);
                  if (!isNaN(num)) {
                    setTotalWinners(num);
                  }
                }
              }}
              placeholder="Choose number of winners"
              className="w-full bg-transparent border-none outline-none text-base text-neutral-9 dark:text-neutral-2 placeholder:text-neutral-6"
            />
          </div>
        </div>

        {/* Claim Session Starts */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-black dark:text-neutral-1 font-medium text-base">
            Claim Session Starts
          </label>
          <div className="border border-border rounded-md px-3.5 py-2.5 bg-white dark:bg-card flex items-center focus-within:border-neutral-8 transition-colors gap-2 relative">
            <i className="fi fi-rr-calendar text-neutral-6 mt-0.5 shrink-0" />
            <input
              type="datetime-local"
              value={claimSession}
              onChange={(e) => setClaimSession(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-base text-neutral-9 dark:text-neutral-2 placeholder:text-neutral-6"
              style={{ colorScheme: 'light dark' }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
