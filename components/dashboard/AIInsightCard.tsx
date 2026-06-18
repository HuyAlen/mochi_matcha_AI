"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";

type Insight = {
  title: string;
  description: string;
  tone: string;
  icon: string;
};

const defaultInsight: Insight = {
  title: "Mind AI đang theo dõi nhịp chăm sóc hôm nay.",
  description:
    "Cập nhật sữa, ngủ, ăn dặm và tã để Mind AI cá nhân hóa gợi ý tốt hơn.",
  tone: "bg-slate-50 text-slate-600 ring-slate-100",
  icon: "✨",
};

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

function buildInsight(
  mochiEntries: TrackingEntry[],
  matchaEntries: TrackingEntry[],
): Insight {
  const mochiSleep = getTotal(mochiEntries, "sleep");
  const matchaSleep = getTotal(matchaEntries, "sleep");
  const mochiMilk = getTotal(mochiEntries, "milk");
  const matchaMilk = getTotal(matchaEntries, "milk");
  const mochiMeals = getTotal(mochiEntries, "meal");
  const matchaMeals = getTotal(matchaEntries, "meal");

  const sleepDiff = Math.abs(mochiSleep - matchaSleep);
  const milkDiff = Math.abs(mochiMilk - matchaMilk);
  const totalEntries = mochiEntries.length + matchaEntries.length;

  if (totalEntries === 0) {
    return {
      title: "Mind AI đang chờ dữ liệu đầu tiên.",
      description:
        "Ghi nhận cữ bú, giấc ngủ hoặc thay tã để AI bắt đầu phân tích nhịp sinh hoạt và đưa ra gợi ý cá nhân hóa cho hai bé.",
      tone: "bg-slate-50 text-slate-600 ring-slate-100",
      icon: "📝",
    };
  }

  if (sleepDiff >= 1.5) {
    const babyName = mochiSleep < matchaSleep ? "Mochi" : "Matcha";

    return {
      title: `${babyName} ngủ ít hơn hôm nay.`,
      description: `Giấc ngủ của hai bé đang lệch khoảng ${format(
        sleepDiff,
      )} giờ. Mẹ có thể theo dõi thêm cữ ngủ chiều hoặc giờ ngủ tối.`,
      tone: "bg-purple-50 text-purple-600 ring-purple-100",
      icon: "🌙",
    };
  }

  if (milkDiff >= 120) {
    const babyName = mochiMilk < matchaMilk ? "Mochi" : "Matcha";

    return {
      title: `${babyName} bú ít hơn hôm nay.`,
      description: `Lượng sữa đang lệch khoảng ${format(
        milkDiff,
      )} ml. Mẹ có thể kiểm tra lại cữ bú gần nhất để cân bằng nhịp chăm sóc.`,
      tone: "bg-pink-50 text-pink-600 ring-pink-100",
      icon: "🍼",
    };
  }

  if (mochiMeals + matchaMeals === 0) {
    return {
      title: "Chưa ghi nhận bữa ăn hôm nay.",
      description:
        "Khi mẹ cập nhật ăn dặm, Mind AI sẽ phân tích khẩu phần và nhịp ăn của từng bé.",
      tone: "bg-amber-50 text-amber-600 ring-amber-100",
      icon: "🥣",
    };
  }

  return {
    title: "Nhịp chăm sóc hôm nay đang ổn định.",
    description:
      "Sữa, ngủ và ăn dặm đang khá cân bằng. Mẹ tiếp tục cập nhật để AI theo dõi xu hướng tốt hơn.",
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    icon: "✨",
  };
}

export default function AIInsightCard() {
  const isHydrated = useIsHydrated();

  const getTodayEntries = useTrackingStore(
    (state: { getTodayEntries: (babyId?: BabyId) => TrackingEntry[] }) =>
      state.getTodayEntries,
  );

  const insight = isHydrated
    ? buildInsight(getTodayEntries("mochi"), getTodayEntries("matcha"))
    : defaultInsight;

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 text-2xl ring-1 ring-pink-100">
          🤖
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Mind AI Insight
          </p>

          <h3 className="mt-1 text-lg font-black leading-snug text-slate-950">
            {insight.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {insight.description}
          </p>

          <Link
            href="/ai-coach"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2.5 text-xs font-black text-white shadow-sm transition active:scale-95"
          >
            🤖 Mở AI Coach
          </Link>
        </div>
      </div>
    </section>
  );
}
