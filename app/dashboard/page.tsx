import AIInsightCard from "@/components/dashboard/AIInsightCard";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import DashboardLiveSessions from "@/components/dashboard/DashboardLiveSessions";
import GrowthSnapshotCard from "@/components/dashboard/GrowthSnapshotCard";
import HealthSnapshotCard from "@/components/dashboard/HealthSnapshotCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import SmartReminderCard from "@/components/dashboard/SmartReminderCard";
import TwinOverviewCard from "@/components/dashboard/TwinOverviewCard";
import AppShell from "@/components/layout/AppShell";
import UpcomingReminderCard from "@/components/dashboard/UpcomingReminderCard";

export default function DashboardPage() {
  return (
    <AppShell>
      <section className="space-y-5">
        <DashboardGreeting />

        <DashboardLiveSessions />

        <SmartReminderCard />

        <TwinOverviewCard />

        <AIInsightCard />

        <GrowthSnapshotCard />

        <HealthSnapshotCard />

        <RecentActivityCard />

        <UpcomingReminderCard />
      </section>
    </AppShell>
  );
}
