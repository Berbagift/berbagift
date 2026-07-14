'use client'
import React from 'react';
import { InboxMailItemData } from '../InboxMailItem';
import { useEffect } from 'react';
import { useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { useRoomDetail } from '@/lib/api/queries';
import { useCountdown } from '@/hooks/use-countdown';

interface RoomPreviewProps {
  details?: InboxMailItemData['details'];
  roomId: string;
}

export function RoomPreview({ details }: RoomPreviewProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getAuthToken() || null);
  }, []);

  const { data: roomData } = useRoomDetail(details?.roomId as string, token);
  const now = Math.floor(Date.now() / 1000);
  const claimStart = roomData?.claim_session_start ? Number(roomData.claim_session_start) : 0;
  const diff = Math.max(0, claimStart - now);

  const { formattedTime, isFinished } = useCountdown(diff);
  console.log(roomData)
  console.log({
    roomId: details?.roomId,
    token,
  });
  return (
    <div className="bg-purple-50/10 dark:bg-purple-950/5 border border-purple-100/50 dark:border-purple-950/20 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-purple-50/30 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
          <i className="fi fi-rr-apps-add text-lg" />
        </div>
        <div>
          <span className="text-[10px] md:text-xs text-neutral-7 dark:text-neutral-6 uppercase tracking-wider font-semibold">Room Invite</span>
          <h4 className="text-sm md:text-base font-bold text-black dark:text-neutral-1 mt-0.5">
            {details?.roomName || 'N/A'}
          </h4>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-neutral-4/40 dark:border-neutral-10/40 grid grid-cols-2 gap-6 text-xs">
        <div>
          <span className="text-neutral-7 dark:text-neutral-6">Countdown:</span>
          <p className="font-semibold text-purple-600 dark:text-purple-400 mt-0.5">{isFinished ? 'Now' : formattedTime}</p>
        </div>
        <div>
          <span className="text-neutral-7 dark:text-neutral-6">Entry Access:</span>
          <p className="font-semibold text-[#22c55e] dark:text-[#4ed17e] mt-0.5">Free / Public</p>
        </div>
      </div>
    </div>
  );
}
