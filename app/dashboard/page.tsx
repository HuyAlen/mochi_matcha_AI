import AIInsightCard from "@/components/dashboard/AIInsightCard";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import GrowthSnapshotCard from "@/components/dashboard/GrowthSnapshotCard";
import HealthSnapshotCard from "@/components/dashboard/HealthSnapshotCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import QuickAddSheet from "@/components/dashboard/quick-add/QuickAddSheet";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import TwinOverviewCard from "@/components/dashboard/TwinOverviewCard";
import AppShell from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <section className="space-y-4 pb-4">
        <DashboardGreeting />

        <TwinOverviewCard />

        <AIInsightCard />

        <QuickActionsCard />

        <GrowthSnapshotCard />

        <HealthSnapshotCard />

        <RecentActivityCard />
      </section>

      <QuickAddSheet />
    </AppShell>
  );
}
