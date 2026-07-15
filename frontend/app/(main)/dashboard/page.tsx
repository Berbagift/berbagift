"use client";

import { Greeting } from '@/components/dashboard/greeting';
import { BalanceSection } from '@/components/dashboard/balance-section';
import { QuickActionsSection } from '@/components/dashboard/quick-actions';
import { RecentActivitySection } from '@/components/dashboard/recent-activity';
import { useUserProfile } from '@/hooks/use-user-profile';

export default function DashboardPage() {
  const { data: user } = useUserProfile();

  const displayName = user?.username 
    ? (user.username.startsWith('G') && user.username.length >= 40
        ? `${user.username.slice(0, 4)}....${user.username.slice(-4)}`
        : user.username)
    : 'User';

  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Welcome Title */}
      <Greeting 
        name={displayName} 
        subtitle="Everything you need, all in one dashboard." 
      />

      {/* Balance Cards Section */}
      <BalanceSection />

      {/* Quick Actions Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-black dark:text-neutral-1">Quick Actions</h2>
        <QuickActionsSection />
      </div>

      {/* Recent Activity Section */}
      <RecentActivitySection />
    </div>
  );
}
