import React from 'react';

interface RoomDataBlockProps {
  icon: string;
  label: string;
  children: React.ReactNode;
}

export function RoomDataBlock({ icon, label, children }: RoomDataBlockProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 text-neutral-8 dark:text-neutral-6 mb-2">
        <i className={`${icon} text-sm`} />
        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
      </div>
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}
