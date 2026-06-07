import React from 'react';
import { cn } from '@/lib/utils';

interface ActionSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: string;
  className?: string;
}

export function ActionSubmitButton({ children, icon, className, ...props }: ActionSubmitButtonProps) {
  return (
    <button
      type={props.type || "submit"}
      className={cn(
        "w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-3 rounded-md text-[16px] font-medium flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
      {icon && <i className={`fi ${icon} mt-0.5`}></i>}
    </button>
  );
}
