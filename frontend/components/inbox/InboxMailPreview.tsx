import React from 'react';
import { Button } from '@/components/ui/button';
import { InboxMailItemData } from './InboxMailItem';
import { RewardPreview } from './previews/RewardPreview';
import { TransferPreview } from './previews/TransferPreview';
import { RoomPreview } from './previews/RoomPreview';
import { SystemPreview } from './previews/SystemPreview';

interface InboxMailPreviewProps {
  item: InboxMailItemData;
  onBack: () => void; // Used for mobile viewport navigation back to list
}

export function InboxMailPreview({ item, onBack }: InboxMailPreviewProps) {
  const { title, date, category, description, details } = item;

  // Category Configuration
  const categoryConfig = {
    Rewards: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: 'fi-rr-gift',
    },
    Rooms: {
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'fi-rr-apps-add',
    },
    Transfer: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'fi-rr-paper-plane',
    },
    System: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      icon: 'fi-rr-settings',
    },
  };

  const config = categoryConfig[category] || categoryConfig.System;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-card p-8 md:p-10 min-h-[400px] md:min-h-[500px]">
      {/* Mobile Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-semibold text-neutral-7 dark:text-neutral-6 hover:text-black dark:hover:text-white md:hidden mb-6 transition-colors cursor-pointer"
      >
        <i className="fi fi-rr-angle-left mt-[1px]" />
        Back to Inbox
      </button>

      {/* Header Info */}
      <div className="flex flex-col items-start gap-3">
        {/* Category Tag */}
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase ${config.bg} ${config.text}`}>
          <i className={`fi ${config.icon} text-[10px] mt-[1px]`} />
          {category}
        </span>
        
        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-black dark:text-neutral-1 leading-snug tracking-tight">
          {title}
        </h3>
        
        {/* Date */}
        <p className="text-xs text-neutral-7 dark:text-neutral-6 font-medium">{date}</p>
      </div>

      {/* Description Content & CTAs with natural breathing room */}
      <div className="mt-8 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <p className="text-sm md:text-base text-neutral-9 dark:text-neutral-3 leading-relaxed font-normal">
            {description}
          </p>

          {/* Dynamic Component Rendering based on Category */}
          {category === 'Rewards' && (
            <RewardPreview details={details} />
          )}
          {category === 'Transfer' && (
            <TransferPreview details={details} />
          )}
          {category === 'Rooms' && (
            <RoomPreview details={details} />
          )}
          {category === 'System' && (
            <SystemPreview details={details} />
          )}
        </div>

        {/* Footer/CTA Row */}
        <div className="mt-8 flex justify-end">
          {category === 'Rewards' && (
            <Button className="bg-[#22c55e] hover:bg-[#1fb356] text-white font-semibold rounded-md shadow-sm h-10 px-5 cursor-pointer">
              Claim Gift Box
            </Button>
          )}
          {category === 'Transfer' && details?.txHash && (
            <Button
              variant="outline"
              className="border-border text-black dark:text-neutral-1 font-semibold rounded-md h-10 px-5 cursor-pointer"
              onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${details.txHash}`, '_blank')}
            >
              Verify on Explorer
            </Button>
          )}
          {category === 'Rooms' && (
            <Button className="bg-[#22c55e] hover:bg-[#1fb356] text-white font-semibold rounded-md shadow-sm h-10 px-5 cursor-pointer">
              Enter Gifting Room
            </Button>
          )}
          {category === 'System' && (
            <Button variant="ghost" className="text-neutral-7 hover:text-black dark:text-neutral-5 dark:hover:text-white rounded-md h-10 px-4 cursor-pointer">
              Acknowledge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
