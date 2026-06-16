import AppShell from "@/components/layout/AppShell";
import ReminderCategoryList from "@/components/reminders/ReminderCategoryList";
import ReminderForm from "@/components/reminders/ReminderForm";
import ReminderStatsCard from "@/components/reminders/ReminderStatsCard";

export default function RemindersPage() {
  return (
    <AppShell>
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Nhắc nhở</h2>
          <p className="mt-1 text-sm text-slate-500">
            Nhắc sữa, ngủ, tã, ăn dặm, thuốc và vaccine cho Mochi & Matcha.
          </p>
        </div>

        <ReminderStatsCard />

        <ReminderCategoryList />

        <ReminderForm />
      </section>
    </AppShell>
  );
}
