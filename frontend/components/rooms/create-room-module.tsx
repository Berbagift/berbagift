'use client';

import React from 'react';
import { useCreateRoomState } from '@/hooks/use-create-room-state';
import { RoomIdentityField } from './create-room/identity-field';
import { RoomDescriptionField } from './create-room/description-field';
import { CapacityWinnersStartsSection } from './create-room/capacity-winners-starts-section';
import { RewardPoolSection } from './create-room/reward-pool-section';

export function CreateRoomModule() {
  const state = useCreateRoomState();

  return (
    <div className="w-full max-w-[740px] mx-auto bg-white dark:bg-card border border-border rounded-md p-6 md:p-8 flex flex-col shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
      
      {/* Logo Section */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-[#16a34a] dark:text-[#22c55e] shrink-0">
            <i className="fi fi-rr-gift text-xl" />
          </div>
          <div className="text-2xl font-bold flex items-center tracking-tight">
            <span className="text-black dark:text-neutral-1">Bagi</span>
            <span className="text-primary-500">THR</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={state.handleSubmit} className="flex flex-col gap-5">
        
        {/* Room Identity Field */}
        <RoomIdentityField 
          value={state.roomIdentity} 
          onChange={state.setRoomIdentity} 
        />

        {/* Room Description Field */}
        <RoomDescriptionField 
          value={state.roomDescription} 
          onChange={state.setRoomDescription} 
        />

        {/* Capacity, Winners and Start Date Section */}
        <CapacityWinnersStartsSection 
          roomCapacity={state.roomCapacity}
          setRoomCapacity={state.setRoomCapacity}
          totalWinners={state.totalWinners}
          setTotalWinners={state.setTotalWinners}
          claimSession={state.claimSession}
          setClaimSession={state.setClaimSession}
        />

        {/* Reward Pool Field Block */}
        <RewardPoolSection 
          tokenId={state.tokenId}
          setTokenId={state.setTokenId}
          rewardAmount={state.rewardAmount}
          setRewardAmount={state.setRewardAmount}
          equivalentFiat={state.getFiatEquivalentText(state.rewardAmount)}
        />

        {/* Bottom Form Actions */}
        <div className="grid grid-cols-2 gap-4 mt-4 w-full">
          <button
            type="button"
            onClick={state.handleSaveDraft}
            className="w-full border border-[#16a34a] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-[#16a34a] py-3 rounded-md text-[16px] font-medium flex items-center justify-center transition-colors cursor-pointer"
          >
            Save draft
          </button>
          <button
            type="submit"
            className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-3 rounded-md text-[16px] font-medium flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            Create Room
          </button>
        </div>

      </form>
    </div>
  );
}
