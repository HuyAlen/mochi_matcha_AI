import type { Reminder } from "@/types/reminder";
import { reminderTypeIcons } from "@/types/reminder";
import ReminderToggle from "./ReminderToggle";

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
          {reminderTypeIcons[reminder.type]}
        </span>

        <div>
          <p className="text-sm font-black text-slate-800">{reminder.title}</p>
          <p className="mt-1 text-xs text-slate-400">
            {new Date(reminder.remindAt).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
            })}
          </p>
        </div>
      </div>

      <ReminderToggle enabled={reminder.enabled} onToggle={onToggle} />
    </div>
  );
}
