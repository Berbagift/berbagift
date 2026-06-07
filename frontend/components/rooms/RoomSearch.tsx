import { Search } from 'lucide-react';
import { ChangeEvent } from 'react';

interface RoomSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function RoomSearch({ value, onChange }: RoomSearchProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative w-full md:w-[340px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-neutral-7 dark:text-neutral-6" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-neutral-5 rounded-md leading-5 bg-white dark:bg-card placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 focus:border-secondary-500 sm:text-sm transition-colors"
        placeholder="Search for rooms or creators..."
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
