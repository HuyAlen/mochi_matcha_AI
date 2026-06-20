"use client";

import { useMemo } from "react";

import { useBabyStore } from "@/store/babyStore";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { Baby } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";

interface BabySummaryCardProps {
  baby: Baby;
  /**
   * Backward compatible only.
   * The card reads from trackingStore so dashboard summary updates immediately
   * after Quick Add save.
   */
  entries?: TrackingEntry[];
}

function isToday(date: string) {
  const input = new Date(date);
  const now = new Date();

  return (
    input.getDate() === now.getDate() &&
    input.getMonth() === now.getMonth() &&
    input.getFullYear() === now.getFullYear()
  );
}

function getTotal(entries: TrackingEntry[], type: TrackingEntry["type"]) {
  return entries
    .filter((entry) => entry.type === type)
    .reduce((sum, entry) => sum + Number(entry.value ?? 0), 0);
}

function getCount(entries: TrackingEntry[], type: TrackingEntry["type"]) {
  return entries.filter((entry) => entry.type === type).length;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getDisplayName(baby: Baby) {
  return baby.nickname?.trim() || baby.name?.trim() || "Bé yêu";
}

function getBabyTone(babyId: string) {
  if (babyId === "matcha") {
    return {
      dotClass: "bg-purple-500",
      textClass: "text-purple-600",
      bgClass: "bg-purple-50",
      ringClass: "ring-purple-100",
    };
  }

  return {
    dotClass: "bg-pink-500",
    textClass: "text-pink-600",
    bgClass: "bg-pink-50",
    ringClass: "ring-pink-100",
  };
}

export default function BabySummaryCard({ baby }: BabySummaryCardProps) {
  const babyProfiles = useBabyStore((state) => state.babyProfiles);
  const entries = useTrackingStore((state) => state.entries);

  const profileBaby = useMemo(() => {
    return babyProfiles.find((item) => item.id === baby.id) ?? baby;
  }, [baby, babyProfiles]);

  const todayEntries = useMemo(() => {
    return entries.filter(
      (entry) => entry.babyId === profileBaby.id && isToday(entry.createdAt),
    );
  }, [entries, profileBaby.id]);

  const milk = getTotal(todayEntries, "milk");
  const sleep = getTotal(todayEntries, "sleep");
  const meals = getCount(todayEntries, "meal");

  const tone = getBabyTone(String(profileBaby.id));
  const displayName = getDisplayName(profileBaby);

  return (
    <article
      className={`rounded-[1.5rem] bg-white p-3.5 shadow-sm ring-1 ${tone.ringClass}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${tone.bgClass} text-xl`}
        >
          {profileBaby.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profileBaby.avatarUrl}
              alt={displayName}
              className="size-full object-cover"
            />
          ) : (
            <span>{profileBaby.avatarEmoji || "👶"}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className={`size-2 shrink-0 rounded-full ${tone.dotClass}`} />
            <h3 className="min-w-0 text-sm font-black leading-tight text-slate-950">
              {displayName}
            </h3>
          </div>

          <p className={`mt-0.5 text-[11px] font-bold ${tone.textClass}`}>
            Hôm nay
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="text-base">🍼</span>
          <span className="text-sm font-black text-slate-950">
            {formatNumber(milk)}ml
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="text-base">😴</span>
          <span className="text-sm font-black text-slate-950">
            {formatNumber(sleep)}h
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="text-base">🍚</span>
          <span className="text-sm font-black text-slate-950">{meals} bữa</span>
        </div>
      </div>
    </article>
  );
}
