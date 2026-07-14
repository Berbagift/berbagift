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



      {/* Form */}
      <form onSubmit={state.handleSubmit} className="flex flex-col gap-5">

        {/* Room Identity Field */}
        <RoomIdentityField
          value={state.roomTitle}
          onChange={state.setRoomTitle}
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
          setTokenId={(id) => state.setTokenId(id as 'XLM' | 'RPK')}
          rewardAmount={state.rewardAmount}
          setRewardAmount={state.setRewardAmount}
          equivalentFiat={state.getFiatEquivalentText(state.rewardAmount)}
        />

        {/* Bottom Form Actions */}
        <div className="grid grid-cols-2 gap-4 mt-4 w-full">
          <button
            type="button"
            onClick={state.handleSaveDraft}
            disabled={state.isSubmitting}
            className="w-full border border-[#16a34a] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-[#16a34a] py-3 rounded-md text-[16px] font-medium flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save draft
          </button>
          <button
            type="submit"
            disabled={state.isSubmitting}
            className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-3 rounded-md text-[16px] font-medium flex items-center justify-center transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.isSubmitting ? (
              <span className="flex items-center gap-2">
                <i className="fi fi-rr-spinner animate-spin"></i> Processing...
              </span>
            ) : (
              "Create Room"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
