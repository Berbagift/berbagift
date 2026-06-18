import React from 'react';

interface RoomDescriptionFieldProps {
  value: string;
  onChange: (val: string) => void;
}

export function RoomDescriptionField({ value, onChange }: RoomDescriptionFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-neutral-8 dark:text-neutral-3 font-medium text-sm">
        Room Description
      </label>
      <div className="border border-border rounded-md px-3.5 py-2.5 bg-white dark:bg-card flex items-start focus-within:border-neutral-8 transition-colors">
        <textarea
          maxLength={50}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your room description right here"
          rows={3}
          className="w-full bg-transparent border-none outline-none text-sm text-black dark:text-neutral-1 placeholder:text-neutral-6 resize-none font-sans"
        />
        <span className="text-xs text-neutral-6 shrink-0 ml-2 mt-auto font-mono">
          {value.length}/50
        </span>
      </div>
    </div>
  );
}
