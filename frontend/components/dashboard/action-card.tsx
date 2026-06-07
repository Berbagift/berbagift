import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  href?: string;
}

export function ActionCard({ title, subtitle, icon, colorClass, href }: ActionCardProps) {
  const content = (
    <>
      <div className={cn("w-14 h-14 rounded-md flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105", colorClass)}>
        <i className={cn(icon, "text-2xl")} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium text-black dark:text-neutral-1 leading-tight">{title}</h3>
        <p className="text-sm font-medium text-neutral-7 dark:text-neutral-6 leading-snug">
          {subtitle}
        </p>
      </div>
    </>
  );

  const className = "flex items-center gap-4 p-4 rounded-md border border-border bg-card shadow-none text-left transition-colors hover:border-border hover:bg-neutral-2/50 group w-full h-full cursor-pointer";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button className={className}>
      {content}
    </button>
  );
}

