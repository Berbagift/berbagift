import React from 'react';

interface GreetingProps {
  name: string;
  subtitle: string;
}

export function Greeting({ name, subtitle }: GreetingProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl md:text-3xl font-medium text-black tracking-tight flex items-center gap-2">
        Good Evening, {name} <span className="text-2xl md:text-3xl">👋</span>
      </h1>
      <p className="text-base font-medium text-neutral-7">
        {subtitle}
      </p>
    </div>
  );
}
