import AgeCounterCard from "@/components/dashboard/AgeCounterCard";
import AIInsightCard from "@/components/dashboard/AIInsightCard";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import GrowthSnapshotCard from "@/components/dashboard/GrowthSnapshotCard";
import MealsTodayCard from "@/components/dashboard/MealsTodayCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import SleepSummaryCard from "@/components/dashboard/SleepSummaryCard";
import TwinOverviewCard from "@/components/dashboard/TwinOverviewCard";
import VaccineReminderCard from "@/components/dashboard/VaccineReminderCard";
import AppShell from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <section className="space-y-5">
        <DashboardGreeting />

        <AgeCounterCard />

        <TwinOverviewCard />

        <AIInsightCard />

        <QuickActionsCard />

        <GrowthSnapshotCard />

        <MealsTodayCard />

        <VaccineReminderCard />

        <SleepSummaryCard />

        <RecentActivityCard />
      </section>
    </AppShell>
  );
}
