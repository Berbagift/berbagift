import React from 'react';

interface RoomIdentityFieldProps {
  value: string;
  onChange: (val: string) => void;
}

export function RoomIdentityField({ value, onChange }: RoomIdentityFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-black dark:text-neutral-1 font-medium text-base">
        Room Identity
      </label>
      <div className="border border-border rounded-md px-3.5 py-2.5 bg-white dark:bg-card flex items-center focus-within:border-neutral-8 transition-colors">
        <input
          type="text"
          maxLength={20}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g Berbagi Berkah"
          className="w-full bg-transparent border-none outline-none text-base text-neutral-9 dark:text-neutral-2 placeholder:text-neutral-6"
        />
        <span className="text-xs text-neutral-6 shrink-0 ml-2 font-mono">
          {value.length}/20
        </span>
      </div>
    </div>
  );
}
