import React from 'react';

interface RoomDataBlockProps {
  icon: string;
  label: string;
  children: React.ReactNode;
}

export function RoomDataBlock({ icon, label, children }: RoomDataBlockProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-neutral-8 dark:text-neutral-6">
        <i className={`${icon} text-base`} />
        <span className="text-base font-medium whitespace-nowrap">{label}</span>
      </div>
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  );
}
