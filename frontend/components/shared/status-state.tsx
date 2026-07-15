import React from 'react';
import { cn } from '@/lib/utils';

interface StatusStateProps {
  icon: string; // Flaticon UIcon class (e.g. 'fi-rr-time-past', 'fi-rr-check', etc.)
  title: React.ReactNode;
  description?: React.ReactNode;
  iconColorClass?: string; // Custom icon color tailwind class (e.g. 'text-red-500')
  bgColorClass?: string; // Custom background circle color tailwind class (e.g. 'bg-red-50 dark:bg-red-950/20')
  className?: string; // Optional custom className for outer wrapper
  
  // Standardized built-in action button props:
  buttonText?: string; // Text for the action button (e.g., 'Done', 'Try Again')
  onButtonClick?: () => void; // Click handler for the action button
  buttonClass?: string; // Optional custom tailwind class to style the button
  
  // Completely custom action element (if you need something other than a standard button)
  action?: React.ReactNode;
}

export function StatusState({
  icon,
  title,
  description,
  iconColorClass = "text-red-500",
  bgColorClass = "bg-red-50 dark:bg-red-950/20",
  className,
  buttonText,
  onButtonClick,
  buttonClass,
  action,
}: StatusStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4 w-full min-h-[60vh]", className)}>
      {/* Icon Circle */}
      <div className={cn("w-[150px] h-[150px] rounded-full flex items-center justify-center mb-6 transition-all duration-300", bgColorClass)}>
        <i className={cn("text-[56px] flex items-center justify-center leading-none", icon, iconColorClass)} />
      </div>
      
      {/* Status Title */}
      <div className="text-2xl font-medium text-neutral-8 dark:text-neutral-3 max-w-[420px] leading-relaxed whitespace-pre-line">
        {title}
      </div>

      {description && (
        <div className="mt-3 text-base text-neutral-500 dark:text-neutral-400 max-w-[420px] leading-relaxed whitespace-pre-line">
          {description}
        </div>
      )}

      {/* Built-in Action Button */}
      {buttonText && (
        <button
          type="button"
          onClick={onButtonClick}
          className={cn(
            "mt-6 px-6 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-md font-medium text-sm transition-colors cursor-pointer shadow-sm focus:outline-none",
            buttonClass
          )}
        >
          {buttonText}
        </button>
      )}

      {/* Completely Custom Action Element */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
