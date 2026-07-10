import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { ActionCard } from './action-card';

const QUICK_ACTIONS = [
  {
    title: 'Send THR',
    subtitle: 'Send rewards instantly to anyone',
    icon: 'fi fi-rr-paper-plane',
    colorClass: 'bg-[#eafdf0] text-[#16a34a]', // Greenish
    href: '/sendthr',
  },
  {
    title: 'Swap to RPK',
    subtitle: 'Swap your assets in seconds',
    icon: 'fi fi-rr-shuffle',
    colorClass: 'bg-[#f6eefe] text-[#a855f7]', // Purplish
    href: '/wallet/swap',
  },
  {
    title: 'Saved Room',
    subtitle: 'Open your saved room and check claim session',
    icon: 'fi fi-rr-bookmark',
    colorClass: 'bg-[#eff6ff] text-[#3b82f6]', // Blueish
    href: '#',
  },
  {
    title: 'Create Room',
    subtitle: 'Create and manage giveaway rooms easily',
    icon: 'fi fi-rr-apps-add', // or any close icon to the one in design
    colorClass: 'bg-[#fffbeb] text-[#f59e0b]', // Yellowish
    href: '/community/create-room',
  },
];

export function QuickActionsSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isTabletRange = useMediaQuery({ minWidth: 1024, maxWidth: 1532 });
  const isTabletLayout = mounted && isTabletRange;

  const gridClass = isTabletLayout 
    ? "grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4" 
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4";

  return (
    <div className={gridClass}>
      {QUICK_ACTIONS.map((action, idx) => (
        <ActionCard key={idx} {...action} />
      ))}
    </div>
  );
}
