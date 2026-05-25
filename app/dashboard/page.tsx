import { PlaceholderSection } from '@/components/ui/PlaceholderSection';
import { Greeting } from '@/components/dashboard/greeting';
import { BalanceSection } from '@/components/dashboard/balance-section';
import { QuickActionsSection } from '@/components/dashboard/quick-actions';
import { RecentActivitySection } from '@/components/dashboard/recent-activity';

export default function DashboardPage() {
  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
      {/* Welcome Title */}
      <Greeting 
        name="Faiz" 
        subtitle="Everything you need, all in one dashboard." 
      />

      {/* Balance Cards Section */}
      <BalanceSection />

      {/* Quick Actions Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-black">Quick Actions</h2>
        <QuickActionsSection />
      </div>

      {/* Recent Activity Section */}
      <RecentActivitySection />
    </div>
  );
}
