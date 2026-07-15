import React from "react"

import { cn } from "@/lib/utils"

interface TooltipProps {
  content: string
  children: React.ReactNode
  className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
  if (!content) return <>{children}</>

  return (
    <div className={cn("relative inline-flex group/tooltip", className)}>
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block z-50 pointer-events-none">
        <div className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap max-w-[280px] truncate">
          {content}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-neutral-900 dark:border-t-neutral-100" />
      </div>
    </div>
  )
}
