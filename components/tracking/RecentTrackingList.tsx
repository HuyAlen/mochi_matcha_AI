"use client";

import { useState } from "react";
import { babies } from "@/src/store/babyStore";
import { getTrackingIcon, getTrackingLabel } from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";

interface RecentTrackingListProps {
  entries: TrackingEntry[];
  selectedBabyId?: BabyId;
  maxVisible?: number;
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatValue(entry: TrackingEntry) {
  if (entry.type === "temperature") return `${entry.value}${entry.unit}`;
  if (entry.type === "mood") return entry.note || "Tâm trạng tốt";
  return `${entry.value} ${entry.unit}`;
}

function getLatestText(entries: TrackingEntry[]) {
  const latest = entries[0];
  if (!latest) return "Chưa có hoạt động hôm nay";

  return `Gần nhất: ${getTrackingLabel(latest.type).toLowerCase()} lúc ${formatTime(
    latest.createdAt,
  )}`;
}

export default function RecentTrackingList({
  entries,
  selectedBabyId,
  maxVisible = 5,
}: RecentTrackingListProps) {
  const [showAll, setShowAll] = useState(false);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const visibleEntries = showAll
    ? sortedEntries
    : sortedEntries.slice(0, maxVisible);
  const hasMore = sortedEntries.length > maxVisible;

  const baby = selectedBabyId
    ? babies.find((item) => item.id === selectedBabyId)
    : undefined;

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-black text-slate-950">Timeline hôm nay</h3>
          <p className="mt-1 text-xs text-slate-500">
            {baby ? `${baby.avatarEmoji} ${baby.name}` : "Mochi & Matcha"}
          </p>
          <p className="mt-1 text-xs font-bold text-pink-500">
            {getLatestText(sortedEntries)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-500">
          {sortedEntries.length} ghi nhận
        </span>
      </div>

      {visibleEntries.length === 0 ? (
        <div className="mt-5 rounded-3xl bg-slate-50 p-5 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
            🌷
          </div>
          <p className="mt-3 font-black text-slate-900">
            Chưa có ghi nhận hôm nay
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Bấm nút + ở thanh dưới để thêm hoạt động đầu tiên.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {visibleEntries.map((entry, index) => {
            const entryBaby = babies.find((item) => item.id === entry.babyId);

            return (
              <div key={entry.id} className="relative flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-pink-50 text-xl ring-1 ring-pink-100">
                    {getTrackingIcon(entry.type)}
                  </span>
                  {index < visibleEntries.length - 1 ? (
                    <span className="mt-2 h-full w-px flex-1 bg-slate-100" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 rounded-3xl bg-slate-50 px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950">
                        {getTrackingLabel(entry.type)} · {formatValue(entry)}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {formatTime(entry.createdAt)} ·{" "}
                        {entryBaby?.name ?? "Bé"}
                      </p>
                    </div>
                    <span className="shrink-0 text-base">
                      {entryBaby?.avatarEmoji}
                    </span>
                  </div>

                  {entry.note && entry.type !== "mood" ? (
                    <p className="mt-2 rounded-2xl bg-white px-3 py-2 text-sm leading-5 text-slate-500">
                      {entry.note}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore ? (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="mt-5 flex w-full items-center justify-center rounded-2xl bg-pink-50 py-3 text-sm font-black text-pink-500 active:scale-[0.99]"
        >
          {showAll ? "Thu gọn timeline" : "Xem tất cả timeline"}
        </button>
      ) : null}
    </div>
  );
}
