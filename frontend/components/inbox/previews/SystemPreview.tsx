import React from 'react';
import { InboxMailItemData } from '../InboxMailItem';

interface SystemPreviewProps {
  details?: InboxMailItemData['details'];
}

export function SystemPreview({ details }: SystemPreviewProps) {
  return (
    <div className="bg-amber-50/10 dark:bg-amber-950/5 border border-amber-100/50 dark:border-amber-950/20 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-50/30 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
          <i className="fi fi-rr-settings text-lg" />
        </div>
        <div>
          <span className="text-[10px] md:text-xs text-neutral-7 dark:text-neutral-6 uppercase tracking-wider font-semibold">System Announcement</span>
          <h4 className="text-sm font-semibold text-black dark:text-neutral-1 mt-0.5">
            Security & Updates
          </h4>
        </div>
      </div>
    </div>
  );
}
