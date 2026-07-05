import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ----------------------------------------------------------------------
// Breadcrumb Route Configuration
// Add or modify route mappings here to customize the breadcrumb text
// ----------------------------------------------------------------------
export const ROUTE_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  // Dashboard
  "/dashboard": [{ label: "Dashboard" }, { label: "Overview" }],
  "/dashboard/activity": [{ label: "Dashboard" }, { label: "All Activity" }],
  "/dashboard/inbox": [{ label: "Dashboard" }, { label: "My Inbox" }],
  
  // Wallet
  "/wallet/balance": [{ label: "Wallet" }, { label: "My Balance" }],
  "/wallet/swap": [{ label: "Wallet" }, { label: "Swap Token" }],
  "/sendthr": [{ label: "Wallet" }, { label: "Send THR" }],
  "/sendthr/envelope": [{ label: "Wallet" }, { label: "Send THR", href: "/sendthr" }, { label: "Envelope Design" }],
  
  // Community
  "/community/explore": [{ label: "Community" }, { label: "Explore Rooms" }],
  "/community/myrooms": [{ label: "Community" }, { label: "My Rooms" }],
  "/community/create-room": [{ label: "Community" }, { label: "My Rooms", href: "/community/myrooms" }, { label: "Create Room" }],
  
  // Account
  "/account/profile": [{ label: "Account" }, { label: "My Profile" }],
  "/account/help": [{ label: "Account" }, { label: "Help Center" }],
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  isMobile?: boolean;
}

export function Breadcrumbs({ items, isMobile = false }: BreadcrumbsProps) {
  const textSize = isMobile ? "text-lg" : "text-xl";

  return (
    <nav aria-label="Breadcrumb" className="min-h-0 min-w-0">
      <ol className={`flex items-center gap-2 font-semibold text-black dark:text-neutral-1 ${textSize}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <li className="flex items-center text-neutral-6">
                  <i aria-hidden="true" className="fi fi-rr-angle-small-right text-[0.85em] leading-none" />
                </li>
              )}
              <li className={`min-w-0 ${isLast ? "flex items-center gap-2" : ""}`}>
                {!isLast && item.href ? (
                  <Link
                    href={item.href}
                    className="block truncate text-neutral-8 dark:text-neutral-6 transition-colors hover:text-black dark:text-neutral-1 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={`truncate ${!isLast ? "text-neutral-8 dark:text-neutral-6" : ""}`}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
