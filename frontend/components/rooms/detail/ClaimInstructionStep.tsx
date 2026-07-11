import React from 'react';

interface ClaimInstructionStepProps {
  icon: string;
  title: string;
  description: string;
}

export function ClaimInstructionStep({ icon, title, description }: ClaimInstructionStepProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-[160px]">
      <div className="w-[75px] h-[75px] rounded-lg bg-primary-50 flex items-center justify-center text-secondary-500 mb-2">
        <i className={`${icon} text-4xl`} />
      </div>
      <h4 className="text-base font-semibold text-black dark:text-neutral-1 mb-1.5 leading-tight">{title}</h4>
      <p className="text-sm font-medium text-neutral-8 dark:text-neutral-6 leading-snug">{description}</p>
    </div>
  );
}
