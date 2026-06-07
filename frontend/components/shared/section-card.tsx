import React from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <div className={cn("border border-border rounded-md p-6 bg-white dark:bg-card", className)}>
      {children}
    </div>
  );
}
