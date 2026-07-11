import React from 'react';

export function InboxEmptyPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center flex-1 min-h-[350px] md:min-h-[450px]">
      <div className="relative w-20 h-20 rounded-full bg-[#e9f9ef] dark:bg-[#0e5327]/20 flex items-center justify-center mb-5 animate-pulse-subtle">
        <div className="relative flex items-center justify-center">
          <i className="fi fi-rr-envelope text-4xl text-[#1fb356] dark:text-[#4ed17e]" />
          {/* Small green notification badge overlay */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#1fb356] dark:bg-[#4ed17e] border-2 border-[#e9f9ef] dark:border-[#1a3d27]" />
        </div>
      </div>
      <h3 className="text-base md:text-lg font-semibold text-neutral-8 dark:text-neutral-2 max-w-[220px] leading-snug">
        Your Mail Body Will Show Up Here
      </h3>
    </div>
  );
}
