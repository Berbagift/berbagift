import React from 'react';
import { StatusBadge, StatusType } from './status-badge';
import { cn } from '@/lib/utils';

export interface ActivityRowProps {
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  type: string;
  details: string;
  amount: string;
  status: StatusType;
  time: string;
  txHash?: string;
  isLast?: boolean;
}

export function ActivityRow({
  icon,
  iconBgClass,
  iconColorClass,
  type,
  details,
  amount,
  status,
  time,
  txHash,
  isLast,
}: ActivityRowProps) {
  const getExplorerLink = (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`;

  return (
    <>
      {/* Mobile Layout */}
      <div className={cn("flex flex-col md:hidden gap-3 py-4 px-6 text-sm", !isLast && "border-b border-border")}>
        {/* Top Mobile Row */}
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", iconBgClass, iconColorClass)}>
              <i className={cn(icon, "mt-1")} />
            </div>
            <span className="font-medium text-black dark:text-neutral-1">{type}</span>
          </div>
          <div className="text-xs text-neutral-7 dark:text-neutral-6">
            {time}
          </div>
        </div>

        {/* Details & Amount */}
        <div className="flex flex-row justify-between items-center">
          <div className="text-black dark:text-neutral-1">{details}</div>
          <div className="font-medium text-black dark:text-neutral-1">{amount}</div>
        </div>

        {/* Status & TxHash */}
        <div className="flex flex-row justify-between items-center mt-1">
          <div><StatusBadge status={status} /></div>
          {txHash && (
            <a href={getExplorerLink(txHash)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
              <span>View Tx</span>
              <i className="fi fi-rr-arrow-up-right" />
            </a>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className={cn("hidden md:grid grid-cols-6 items-center gap-4 py-4 px-6 text-sm", !isLast && "border-b border-border")}>
        <div className="col-span-1 flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", iconBgClass, iconColorClass)}>
            <i className={cn(icon, "mt-1")} />
          </div>
          <span className="font-medium text-black dark:text-neutral-1">{type}</span>
        </div>
        <div className="col-span-1 text-black dark:text-neutral-1">
          {details}
        </div>
        <div className="col-span-1 font-medium text-black dark:text-neutral-1">
          {amount}
        </div>
        <div className="col-span-1">
          <StatusBadge status={status} />
        </div>
        <div className="col-span-1">
          {txHash ? (
            <a href={getExplorerLink(txHash)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 truncate w-24" title={txHash}>
              <span className="truncate">{txHash.substring(0, 6)}...</span>
              <i className="fi fi-rr-arrow-up-right text-[10px]" />
            </a>
          ) : (
            <span className="text-neutral-400">-</span>
          )}
        </div>
        <div className="col-span-1 text-right text-neutral-7 dark:text-neutral-6">
          {time}
        </div>
      </div>
    </>
  );
}
