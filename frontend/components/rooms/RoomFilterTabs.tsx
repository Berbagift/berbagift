import { cn } from '@/lib/utils';

interface RoomFilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const TABS = ['All Rooms', 'Upcoming', 'High Rewards', 'Saved Rooms'];

export function RoomFilterTabs({ activeFilter, onFilterChange }: RoomFilterTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {TABS.map((tab) => {
        const isActive = activeFilter === tab;
        return (
          <button
            key={tab}
            onClick={() => onFilterChange(tab)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
              isActive 
                ? "bg-secondary-500 text-white border-secondary-500 hover:bg-secondary-600" 
                : "bg-white dark:bg-card text-neutral-10 dark:text-neutral-4 border-border hover:bg-neutral-2 dark:bg-neutral-10"
            )}
          >
            {tab === 'All Rooms' && <i className="fi fi-rr-apps mr-2" />}
            {tab === 'Upcoming' && <i className="fi fi-rr-time-past mr-2" />}
            {tab === 'High Rewards' && <i className="fi fi-rr-gift mr-2" />}
            {tab === 'Saved Rooms' && <i className="fi fi-rr-bookmark mr-2" />}
            {tab}
          </button>
        );
      })}
    </div>
  );
}
