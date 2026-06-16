"use client";

import { useState } from "react";
import { useReminderStore } from "@/src/store/reminderStore";
import type { ReminderCategory } from "@/types/reminder";

export default function ReminderForm() {
  const [open, setOpen] = useState(false);

  const addReminder = useReminderStore(
    (state: {
      addReminder: (reminder: {
        category: ReminderCategory;
        title: string;
        scheduleText: string;
        time?: string;
        enabled: boolean;
      }) => void;
    }) => state.addReminder,
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-pink-500 py-4 text-sm font-black text-white shadow-sm"
      >
        + Thêm nhắc nhở
      </button>
    );
  }

  return (
    <form
      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-pink-100"
      onSubmit={(event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const title = (form.elements.namedItem("title") as HTMLInputElement)
          .value;
        const category = (
          form.elements.namedItem("category") as HTMLSelectElement
        ).value as ReminderCategory;
        const time = (form.elements.namedItem("time") as HTMLInputElement)
          .value;

        if (!title.trim()) return;

        addReminder({
          category,
          title: title.trim(),
          scheduleText: time ? `Hằng ngày ${time}` : "Hằng ngày",
          time,
          enabled: true,
        });

        form.reset();
        setOpen(false);
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-950">Thêm nhắc nhở</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm font-bold text-slate-400"
        >
          Đóng
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <input
          name="title"
          placeholder="Tên nhắc nhở"
          className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            name="category"
            defaultValue="milk"
            className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 outline-none"
          >
            <option value="milk">Sữa</option>
            <option value="sleep">Ngủ</option>
            <option value="diaper">Tã</option>
            <option value="meal">Ăn dặm</option>
            <option value="medicine">Thuốc</option>
            <option value="vaccine">Vaccine</option>
          </select>

          <input
            name="time"
            type="time"
            className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-2xl bg-pink-500 py-3 text-sm font-black text-white"
      >
        Lưu nhắc nhở
      </button>
    </form>
  );
}
