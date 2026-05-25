import React from 'react';
import { cn } from '@/lib/utils';

interface PlaceholderSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

export function PlaceholderSection({ label, className, ...props }: PlaceholderSectionProps) {
  return (
    <div 
      className={cn(
        "w-full rounded-md border border-dashed border-neutral-5 flex items-center justify-center bg-muted/20 text-neutral-7",
        className
      )}
      {...props}
    >
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
