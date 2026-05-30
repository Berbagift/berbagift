import { ReactNode } from 'react';

interface RoomGridProps {
  children: ReactNode;
}

export function RoomGrid({ children }: RoomGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
      {children}
    </div>
  );
}
