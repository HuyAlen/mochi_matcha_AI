import {
  AIInsightCard,
  DashboardGreeting,
  DashboardLiveSessions,
  GrowthSnapshotCard,
  HealthSnapshotCard,
  RecentActivityCard,
  SmartReminderCard,
  TwinOverviewCard,
  UpcomingReminderCard,
} from "@/features/dashboard";

import AppShell from "@/components/layout/AppShell";

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
