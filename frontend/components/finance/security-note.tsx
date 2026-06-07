import React from 'react';
import { cn } from '@/lib/utils';

interface SecurityNoteProps {
  text: string;
  icon?: string;
  className?: string;
}

export function SecurityNote({ text, icon = "fi-rr-shield-check", className }: SecurityNoteProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1.5 text-neutral-8", className)}>
      <i className={`fi ${icon} text-[14px] mt-1`}></i>
      <span className="text-[13px] font-medium">{text}</span>
    </div>
  );
}
