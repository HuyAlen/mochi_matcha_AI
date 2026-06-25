"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { buildVaccineSummary } from "@/src/services/health/vaccineAnalyzer";
import { useTrackingStore } from "@/src/store/trackingStore";
import { useVaccineStore } from "@/src/store/vaccineStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";
import type { BabyVaccineRecord } from "@/types/vaccine";

function subscribeHydrationStore() {
  return () => {};
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

function useIsHydrated() {
  return useSyncExternalStore(
    subscribeHydrationStore,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
}

function getTotal(entries: TrackingEntry[], type: TrackingEntry["type"]) {
  return entries
    .filter((entry) => entry.type === type)
    .reduce((sum, entry) => sum + Number(entry.value ?? 0), 0);
}

function format(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getDaysLeft(date?: string) {
  if (!date) return null;

  return Math.ceil(
    (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );
}

function getSleepLabel(
  isHydrated: boolean,
  mochiSleep: number,
  matchaSleep: number,
) {
  if (!isHydrated) return "Đang tải dữ liệu";

  const totalSleep = mochiSleep + matchaSleep;

  if (totalSleep === 0) return "Chưa ghi nhận giấc ngủ";

  return `Mochi ${format(mochiSleep)}h · Matcha ${format(matchaSleep)}h`;
}

function getMealLabel(
  isHydrated: boolean,
  mochiMeals: number,
  matchaMeals: number,
) {
  if (!isHydrated) return "Đang tải dữ liệu";

  const totalMeals = mochiMeals + matchaMeals;

  if (totalMeals === 0) return "Chưa ghi nhận bữa ăn";

  return `${totalMeals} bữa ăn hôm nay`;
}

export default function HealthSnapshotCard() {
  const isHydrated = useIsHydrated();

  const getTodayEntries = useTrackingStore(
    (state: { getTodayEntries: (babyId?: BabyId) => TrackingEntry[] }) =>
      state.getTodayEntries,
  );

  const records = useVaccineStore(
    (state: { records: BabyVaccineRecord[] }) => state.records,
  );

  const mochiEntries = getTodayEntries("mochi");
  const matchaEntries = getTodayEntries("matcha");

  const mochiSleep = getTotal(mochiEntries, "sleep");
  const matchaSleep = getTotal(matchaEntries, "sleep");
  const mochiMeals = getTotal(mochiEntries, "meal");
  const matchaMeals = getTotal(matchaEntries, "meal");

  const mochiVaccine = buildVaccineSummary("mochi", records);
  const matchaVaccine = buildVaccineSummary("matcha", records);
  const nextVaccineTitle =
    mochiVaccine.nextVaccineTitle || matchaVaccine.nextVaccineTitle;
  const nextVaccineDate =
    mochiVaccine.nextVaccineDate || matchaVaccine.nextVaccineDate;
  const daysLeft = getDaysLeft(nextVaccineDate);

  const vaccineLabel =
    daysLeft === null
      ? "Chưa có lịch sắp tới"
      : daysLeft >= 0
        ? `Còn ${daysLeft} ngày`
        : `Quá lịch ${Math.abs(daysLeft)} ngày`;

  const items = [
    {
      href: "/tracking",
      icon: "🌙",
      label: "Giấc ngủ",
      value: getSleepLabel(isHydrated, mochiSleep, matchaSleep),
    },
    {
      href: "/nutrition",
      icon: "🥣",
      label: "Ăn dặm",
      value: getMealLabel(isHydrated, mochiMeals, matchaMeals),
    },
    {
      href: "/vaccines",
      icon: "💉",
      label: nextVaccineTitle || "Tiêm chủng",
      value: isHydrated ? vaccineLabel : "Đang tải dữ liệu",
    },
  ];

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Health Snapshot
          </p>
          <h3 className="mt-1 font-black text-slate-950">
            Sức khỏe & sinh hoạt
          </h3>
        </div>

        <Link href="/tracking" className="text-xs font-black text-pink-500">
          Chi tiết
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100 transition active:scale-[0.99]"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-xl">
              {item.icon}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-black text-slate-950">
                {item.label}
              </span>
              <span className="mt-0.5 block truncate text-xs font-semibold text-slate-400">
                {item.value}
              </span>
            </span>

            <span className="text-xl font-light text-slate-300">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
