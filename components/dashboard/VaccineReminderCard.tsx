"use client";

import Link from "next/link";
import { buildVaccineSummary } from "@/src/services/health/vaccineAnalyzer";
import { useVaccineStore } from "@/src/store/vaccineStore";
import type { BabyVaccineRecord } from "@/types/vaccine";

function getDaysLeft(date?: string) {
  if (!date) return null;

  return Math.ceil(
    (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );
}

export default function VaccineReminderCard() {
  const records = useVaccineStore(
    (state: { records: BabyVaccineRecord[] }) => state.records,
  );

  const mochi = buildVaccineSummary("mochi", records);
  const matcha = buildVaccineSummary("matcha", records);
  const vaccineDate = mochi.nextVaccineDate ?? matcha.nextVaccineDate;
  const daysLeft = getDaysLeft(vaccineDate);

  return (
    <Link
      href="/vaccines"
      className="block rounded-3xl bg-linear-to-br from-pink-100 to-purple-100 p-5 shadow-sm ring-1 ring-pink-100"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-purple-700">
            💉 Vaccine Reminder
          </p>
          <h3 className="mt-2 text-lg font-black text-slate-950">
            {mochi.nextVaccineTitle}
          </h3>

          {vaccineDate ? (
            <p className="mt-2 text-sm font-black text-slate-700">
              📅 {new Date(vaccineDate).toLocaleDateString("vi-VN")}
            </p>
          ) : null}

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {daysLeft === null
              ? "Chưa có lịch tiêm sắp tới."
              : daysLeft >= 0
                ? `Còn khoảng ${daysLeft} ngày nữa tới lịch tiêm tiếp theo.`
                : `Mũi này đã quá lịch khoảng ${Math.abs(daysLeft)} ngày.`}
          </p>
        </div>

        <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-white/80 text-4xl shadow-sm">
          💉
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/70 p-3">
          <p className="font-black text-slate-950">Mochi</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {mochi.upcomingCount} mũi sắp tới
          </p>
        </div>
        <div className="rounded-2xl bg-white/70 p-3">
          <p className="font-black text-slate-950">Matcha</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {matcha.upcomingCount} mũi sắp tới
          </p>
        </div>
      </div>
    </Link>
  );
}
