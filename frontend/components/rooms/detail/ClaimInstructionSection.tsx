import React from 'react';
import { ClaimInstructionStep } from './ClaimInstructionStep';

const INSTRUCTION_STEPS = [
  {
    icon: 'fi fi-rr-door-open',
    title: 'Enter waiting room',
    description: "Enter the waiting room and make sure you're ready",
  },
  {
    icon: 'fi fi-rr-time-fast',
    title: 'Countdown Begins',
    description: 'The timer will count down until the claim session starts',
  },
  {
    icon: 'fi fi-rr-unlock',
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
    <div className="bg-white dark:bg-card border border-border rounded-md p-4 sm:p-6 lg:p-8 w-full shadow-sm ">
      <div className="flex items-center gap-2 mb-6 md:mb-8">
        <h3 className="text-lg md:text-xl font-semibold text-black dark:text-neutral-1">How to claim reward</h3>
        <i className="fi fi-rr-info text-neutral-6" />
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 lg:gap-12 mb-8 md:mb-12">
        {INSTRUCTION_STEPS.map((step, index) => (
          <ClaimInstructionStep
            key={index}
            icon={step.icon}
            title={step.title}
            description={step.description}
          />
        ))}
      </div>

      <div className="w-full bg-accent-orange-50 border border-accent-orange-100 rounded-md px-4 py-1.5 flex items-start sm:items-center gap-2.5">
        <i className="fi fi-rr-info text-accent-orange-500 mt-0.5 sm:mt-0 text-sm" />
        <span className="text-sm font-medium text-accent-orange-600">
          Rewards must be claimed within the available claim period before they expire automatically.
        </span>
      </div>
    </div>
  );
}
