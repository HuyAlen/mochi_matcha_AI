"use client";

import { Baby, BedDouble, Bell, Milk, Pill } from "lucide-react";
import type { ReminderType } from "@/types/reminder";
import { reminderTypeDescriptions, reminderTypeLabels } from "@/types/reminder";

const reminderTypes: Array<{ type: ReminderType; icon: typeof Milk }> = [
  { type: "feed", icon: Milk },
  { type: "sleep", icon: BedDouble },
  { type: "pump", icon: Baby },
  { type: "medicine", icon: Pill },
  { type: "custom", icon: Bell },
];

type ReminderTypePickerProps = {
  value: ReminderType;
  onChange: (value: ReminderType) => void;
};

export default function ReminderTypePicker({
  value,
  onChange,
}: ReminderTypePickerProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {reminderTypes.map((item) => {
        const Icon = item.icon;
        const active = value === item.type;

        return (
          <button
            key={item.type}
            type="button"
            onClick={() => onChange(item.type)}
            className={`rounded-3xl border p-4 text-left transition ${
              active
                ? "border-violet-200 bg-violet-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-violet-100 hover:bg-violet-50/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`rounded-2xl p-2 ${active ? "bg-white" : "bg-slate-50"}`}
              >
                <Icon
                  className={`h-5 w-5 ${active ? "text-violet-600" : "text-slate-500"}`}
                />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {reminderTypeLabels[item.type]}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {reminderTypeDescriptions[item.type]}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
