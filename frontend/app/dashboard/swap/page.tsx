import React from 'react';
import { SwapModule } from '@/components/swap/swap-module';

export default function SwapPage() {
  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-8 flex flex-col min-h-full">
      {/* Main Content Area - Centered */}
      <div className="flex-1 flex justify-center pb-12">
        <div className="w-full">
          <SwapModule />
        </div>
      </div>
    </div>
  );
}
