"use client";

import ReminderForm from "@/components/reminders/ReminderForm";
import ReminderList from "@/components/reminders/ReminderList";
import NotificationPermissionCard from "@/components/tracking/NotificationPermissionCard";

export default function ReminderCenter() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pb-28 pt-4">
      <section className="rounded-[2rem] bg-gradient-to-br from-violet-600 to-fuchsia-500 p-5 text-white shadow-sm">
        <p className="text-sm font-semibold text-white/80">Sprint 11.4</p>
        <h1 className="mt-1 text-2xl font-black">Reminder Engine</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
          Quản lý Feed, Sleep, Pump, Medicine và Custom reminder cho song sinh.
        </p>
      </section>

      <NotificationPermissionCard />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.9fr]">
        <ReminderForm />
        <div className="space-y-3">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-lg font-bold text-slate-950">Hẹn nhắc sắp tới</p>
            <p className="mt-1 text-sm text-slate-500">
              Danh sách hẹn nhắc đang hoạt động.
            </p>
          </div>
          <ReminderList />
        </div>
      </div>
    </div>
  );
}
