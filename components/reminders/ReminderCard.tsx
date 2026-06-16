import type { Reminder } from "@/types/reminder";
import ReminderToggle from "./ReminderToggle";

const iconMap = {
  milk: "🍼",
  sleep: "🌙",
  diaper: "🧷",
  meal: "🥣",
  medicine: "💊",
  vaccine: "💉",
};

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: () => void;
}

export default function ReminderCard({
  reminder,
  onToggle,
}: ReminderCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
          {iconMap[reminder.category]}
        </span>

        <div>
          <p className="text-sm font-black text-slate-800">{reminder.title}</p>
          <p className="mt-1 text-xs text-slate-400">{reminder.scheduleText}</p>
        </div>
      </div>

      <ReminderToggle enabled={reminder.enabled} onToggle={onToggle} />
    </div>
  );
}
