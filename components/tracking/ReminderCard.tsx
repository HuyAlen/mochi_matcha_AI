"use client";

import { useState } from "react";

const reminders = [
  ["🍼", "Nhắc cho bé uống sữa", "3 giờ/lần"],
  ["🌙", "Nhắc giờ ngủ", "Buổi tối 19:00"],
  ["🧷", "Nhắc thay tã", "2 giờ/lần"],
  ["🥣", "Nhắc ăn dặm", "11:00, 17:00"],
];

export default function ReminderCard() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-950">Nhắc nhở</h3>
        <button
          type="button"
          onClick={() => setEnabled((current) => !current)}
          className={`h-7 w-12 rounded-full p-1 transition ${
            enabled ? "bg-pink-500" : "bg-slate-200"
          }`}
        >
          <span
            className={`block size-5 rounded-full bg-white transition ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {reminders.map(([icon, title, subtitle]) => (
          <div
            key={title}
            className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-xl">
                {icon}
              </span>
              <div>
                <p className="text-sm font-black text-slate-800">{title}</p>
                <p className="text-xs text-slate-400">{subtitle}</p>
              </div>
            </div>
            <span className="flex size-7 items-center justify-center rounded-full bg-pink-100 text-xs font-black text-pink-500">
              ✓
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-2xl bg-pink-500 py-3 text-sm font-black text-white"
      >
        + Thêm nhắc nhở
      </button>
    </div>
  );
}
