import React from 'react';

interface ClaimInstructionStepProps {
  icon: string;
  title: string;
  description: string;
}

export function ClaimInstructionStep({ icon, title, description }: ClaimInstructionStepProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-[240px]">
      <div className="w-12 h-12 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 mb-3 border border-secondary-100">
        <i className={`${icon} text-2xl`} />
      </div>
      <h4 className="text-base font-semibold text-black dark:text-neutral-1 mb-1.5 leading-tight">{title}</h4>
      <p className="text-sm text-neutral-8 dark:text-neutral-6 leading-relaxed">{description}</p>
    </div>
  );
}
