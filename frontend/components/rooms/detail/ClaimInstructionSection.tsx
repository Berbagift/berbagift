import React from 'react';
import { ClaimInstructionStep } from './ClaimInstructionStep';

const INSTRUCTION_STEPS = [
  {
    icon: 'fi fi-rr-apps-add',
    title: 'How to claim reward',
    description: "Enter the waiting room and make sure you're ready",
  },
  {
    icon: 'fi fi-rr-time-fast',
    title: 'Countdown Begins',
    description: 'The timer will count down until the claim session starts',
  },
  {
    icon: 'fi fi-rr-lock',
    title: 'Claim button unlocks',
    description: 'When the timer is zero, the claim button will become active',
  },
  {
    icon: 'fi fi-rr-gift',
    title: 'The winners',
    description: 'Fastest user win and must claim reward in certain period',
  },
];

export function ClaimInstructionSection() {
  return (
    <div className="bg-white dark:bg-card border border-border rounded-lg p-6 sm:p-8 lg:p-10 w-full shadow-none">
      <div className="flex items-center gap-3 mb-8 md:mb-12">
        <h3 className="text-xl font-medium text-black dark:text-neutral-1">How to claim reward</h3>
        <i className="fi fi-rr-info text-xl text-neutral-8 dark:text-neutral-4" />
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 lg:gap-16 mb-10 md:mb-12">
        {INSTRUCTION_STEPS.map((step, index) => (
          <ClaimInstructionStep
            key={index}
            icon={step.icon}
            title={step.title}
            description={step.description}
          />
        ))}
      </div>

      <div className="w-full bg-warning-50 rounded-lg p-2.5 flex items-center gap-3">
        <i className="fi fi-rr-info text-warning-500 text-2xl flex-shrink-0" />
        <span className="text-base font-medium text-warning-500">
          Rewards must be claimed within the available claim period before they expire automatically.
        </span>
      </div>
    </div>
  );
}
