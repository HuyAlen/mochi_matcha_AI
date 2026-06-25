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
      className="block rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Tiêm chủng
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            {mochi.nextVaccineTitle}
          </h3>

          {vaccineDate ? (
            <p className="mt-2 text-sm font-black text-slate-700">
              {new Date(vaccineDate).toLocaleDateString("vi-VN")}
            </p>
          ) : null}

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {daysLeft === null
              ? "Chưa có lịch tiêm sắp tới."
              : daysLeft >= 0
                ? `Còn khoảng ${daysLeft} ngày nữa tới lịch tiêm tiếp theo.`
                : `Mũi này đã quá lịch khoảng ${Math.abs(daysLeft)} ngày.`}
          </p>
        </div>

        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-2xl ring-1 ring-sky-100">
          💉
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="font-black text-slate-950">Mochi</p>
          <p className="mt-1 text-xs font-bold text-slate-400">
            {mochi.upcomingCount} mũi sắp tới
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="font-black text-slate-950">Matcha</p>
          <p className="mt-1 text-xs font-bold text-slate-400">
            {matcha.upcomingCount} mũi sắp tới
          </p>
        </div>
      </div>
    </Link>
  );
}
