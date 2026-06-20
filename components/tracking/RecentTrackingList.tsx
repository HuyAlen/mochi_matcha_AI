"use client";

import { useMemo, useState } from "react";
import { useBabyStore } from "@/src/store/babyStore";
import { getTrackingIcon, getTrackingLabel } from "@/src/store/trackingStore";
import type { Baby, BabyId } from "@/types/baby";
import type { TrackingEntry } from "@/types/tracking";

interface RecentTrackingListProps {
  entries: TrackingEntry[];
  onEdit: (entry: TrackingEntry) => void;
  onDelete: (entryId: string) => void;
  onDuplicate: (entryId: string) => void;
}

const TYPE_TONE: Record<
  string,
  {
    iconBg: string;
    iconRing: string;
    dot: string;
    chip: string;
    accent: string;
    border: string;
    softBg: string;
  }
> = {
  milk: {
    iconBg: "bg-pink-50",
    iconRing: "ring-pink-100",
    dot: "bg-pink-300",
    chip: "bg-pink-50 text-pink-600 ring-pink-100",
    accent: "text-pink-600",
    border: "border-l-pink-300",
    softBg: "bg-pink-50/60",
  },
  meal: {
    iconBg: "bg-amber-50",
    iconRing: "ring-amber-100",
    dot: "bg-amber-300",
    chip: "bg-amber-50 text-amber-600 ring-amber-100",
    accent: "text-amber-600",
    border: "border-l-amber-300",
    softBg: "bg-amber-50/60",
  },
  sleep: {
    iconBg: "bg-purple-50",
    iconRing: "ring-purple-100",
    dot: "bg-purple-300",
    chip: "bg-purple-50 text-purple-600 ring-purple-100",
    accent: "text-purple-600",
    border: "border-l-purple-300",
    softBg: "bg-purple-50/60",
  },
  diaper: {
    iconBg: "bg-cyan-50",
    iconRing: "ring-cyan-100",
    dot: "bg-cyan-300",
    chip: "bg-cyan-50 text-cyan-600 ring-cyan-100",
    accent: "text-cyan-600",
    border: "border-l-cyan-300",
    softBg: "bg-cyan-50/60",
  },
  temperature: {
    iconBg: "bg-emerald-50",
    iconRing: "ring-emerald-100",
    dot: "bg-emerald-300",
    chip: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    accent: "text-emerald-600",
    border: "border-l-emerald-300",
    softBg: "bg-emerald-50/60",
  },
  medicine: {
    iconBg: "bg-rose-50",
    iconRing: "ring-rose-100",
    dot: "bg-rose-300",
    chip: "bg-rose-50 text-rose-600 ring-rose-100",
    accent: "text-rose-600",
    border: "border-l-rose-300",
    softBg: "bg-rose-50/60",
  },
  mood: {
    iconBg: "bg-violet-50",
    iconRing: "ring-violet-100",
    dot: "bg-violet-300",
    chip: "bg-violet-50 text-violet-600 ring-violet-100",
    accent: "text-violet-600",
    border: "border-l-violet-300",
    softBg: "bg-violet-50/60",
  },
};

const FALLBACK_TONE = {
  iconBg: "bg-slate-50",
  iconRing: "ring-slate-100",
  dot: "bg-slate-300",
  chip: "bg-slate-50 text-slate-600 ring-slate-100",
  accent: "text-slate-600",
  border: "border-l-slate-200",
  softBg: "bg-slate-50/60",
};

function getTone(type: string) {
  return TYPE_TONE[type] ?? FALLBACK_TONE;
}

function formatTime(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "--:--";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(parsedDate);
}

function formatDay(date: string) {
  const input = new Date(date);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const sameDate = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDate(input, today)) return "Hôm nay";
  if (sameDate(input, yesterday)) return "Hôm qua";

  return input.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function formatShortDay(date: string) {
  const input = new Date(date);

  return input.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function getEntryTitle(entry: TrackingEntry) {
  if (entry.type === "milk") return "Sữa";
  if (entry.type === "meal") return "Ăn dặm";
  if (entry.type === "sleep") return "Giấc ngủ";
  if (entry.type === "diaper") return "Thay tã";
  if (entry.type === "temperature") return "Sức khỏe";
  if (entry.type === "medicine") return "Vaccine / thuốc";

  return getTrackingLabel(entry.type);
}

function getPrimaryNote(note?: string) {
  if (!note) return "";

  return (
    note
      .split(" · ")
      .map((part) => part.trim())
      .filter(Boolean)[0] || note
  );
}

function getSecondaryNote(entry: TrackingEntry) {
  if (!entry.note || entry.type === "mood") return "";

  const parts = entry.note
    .split(" · ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) return "";

  return parts.slice(1, 4).join(" · ");
}

function formatValue(entry: TrackingEntry) {
  const value = Number(entry.value ?? 0);
  const unit = entry.unit ?? "";

  if (entry.type === "temperature") return `${entry.value}${unit}`;
  if (entry.type === "mood") return entry.note || "Ghi nhận tâm trạng";

  if (entry.type === "meal") {
    return (
      getPrimaryNote(entry.note) || (unit ? `${value} ${unit}` : `${value} bữa`)
    );
  }

  if (entry.type === "sleep") {
    const sleepText = Number.isInteger(value)
      ? String(value)
      : value.toFixed(1);
    return `${sleepText} ${unit || "giờ"}`.trim();
  }

  if (entry.type === "diaper") {
    return getPrimaryNote(entry.note) || "Thay tã";
  }

  return `${value} ${unit}`.trim();
}

function getBabyProfile(
  babyProfiles: Baby[],
  babyId: BabyId | string,
): Baby | undefined {
  return babyProfiles.find((item) => item.id === babyId);
}

function getBabyDisplayName(babyProfiles: Baby[], babyId: BabyId | string) {
  const baby = getBabyProfile(babyProfiles, babyId);

  return baby?.nickname?.trim() || baby?.name?.trim() || "Bé";
}

function getBabyInitial(babyProfiles: Baby[], babyId: BabyId | string) {
  const name = getBabyDisplayName(babyProfiles, babyId);

  if (name.toLowerCase().startsWith("matcha")) return "Ma";
  if (name.toLowerCase().startsWith("mochi")) return "Mo";

  return name.slice(0, 2);
}

function getBabyAvatarSrc(babyProfiles: Baby[], babyId: BabyId | string) {
  const baby = getBabyProfile(babyProfiles, babyId);

  return baby?.avatarUrl || "";
}

function getBabyAvatarEmoji(babyProfiles: Baby[], babyId: BabyId | string) {
  const baby = getBabyProfile(babyProfiles, babyId);

  return baby?.avatarEmoji || "👶";
}

function getDailyInsight(entries: TrackingEntry[], babyProfiles: Baby[]) {
  const milkTotal = entries
    .filter((entry) => entry.type === "milk")
    .reduce((sum, entry) => sum + Number(entry.value ?? 0), 0);

  const mealCount = entries.filter((entry) => entry.type === "meal").length;

  const sleepHours = entries
    .filter((entry) => entry.type === "sleep")
    .reduce((sum, entry) => sum + Number(entry.value ?? 0), 0);

  const diaperCount = entries.filter((entry) => entry.type === "diaper").length;

  if (entries.length === 0) {
    return "Chưa đủ dữ liệu để tạo insight trong ngày này.";
  }

  if (entries.length === 1) {
    const onlyEntry = entries[0];
    const babyName = getBabyDisplayName(babyProfiles, onlyEntry.babyId);

    if (onlyEntry.type === "milk") {
      return `${babyName} đã uống ${Number(onlyEntry.value ?? 0)}ml. Giấc ngủ và bữa ăn chưa được ghi nhận trong bộ lọc này.`;
    }

    if (onlyEntry.type === "meal") {
      return `${babyName} đã có 1 bữa ăn. Mẹ có thể ghi thêm sữa, ngủ hoặc thay tã để Mind AI phân tích tốt hơn.`;
    }

    return `Hôm nay mới có 1 hoạt động được ghi nhận. Thêm dữ liệu sẽ giúp Mind AI phân tích chính xác hơn.`;
  }

  const parts = [
    milkTotal > 0 ? `tổng sữa ${milkTotal}ml` : "",
    mealCount > 0 ? `${mealCount} bữa ăn` : "",
    sleepHours > 0 ? `ngủ ${sleepHours.toFixed(1).replace(".0", "")} giờ` : "",
    diaperCount > 0 ? `${diaperCount} lần thay tã` : "",
  ].filter(Boolean);

  if (parts.length === 0) {
    return `${entries.length} hoạt động đã được ghi nhận trong ngày này.`;
  }

  return `Trong ngày này đã ghi nhận ${parts.join(", ")}.`;
}

export default function RecentTrackingList({
  entries,
  onEdit,
  onDelete,
  onDuplicate,
}: RecentTrackingListProps) {
  const [selectedEntry, setSelectedEntry] = useState<TrackingEntry | null>(
    null,
  );
  const babyProfiles = useBabyStore((state) => state.babyProfiles);

  const groupedEntries = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sorted.reduce<Record<string, TrackingEntry[]>>((groups, entry) => {
      const key = new Date(entry.createdAt).toDateString();
      groups[key] = groups[key] ? [...groups[key], entry] : [entry];
      return groups;
    }, {});
  }, [entries]);

  const groupKeys = Object.keys(groupedEntries);

  const closeActionMenu = () => setSelectedEntry(null);

  const handleEdit = () => {
    if (!selectedEntry) return;
    onEdit(selectedEntry);
    closeActionMenu();
  };

  const handleDuplicate = () => {
    if (!selectedEntry) return;
    onDuplicate(selectedEntry.id);
    closeActionMenu();
  };

  const handleDelete = () => {
    if (!selectedEntry) return;
    onDelete(selectedEntry.id);
    closeActionMenu();
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-4xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-pink-50 text-4xl ring-1 ring-pink-100">
          🐰
        </div>
        <h3 className="mt-4 text-lg font-black text-slate-950">
          Chưa có dữ liệu
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Chưa có ghi nhận nào theo bộ lọc hiện tại. Bấm nút + ở thanh dưới để
          thêm hoạt động chăm bé mới.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {groupKeys.map((key) => {
          const dayEntries = groupedEntries[key] ?? [];
          const firstEntry = dayEntries[0];
          const shouldShowTimelineLine = dayEntries.length > 1;

          return (
            <section key={key} className="space-y-2.5">
              <div className="sticky top-2 z-10 flex items-center justify-between rounded-3xl bg-white/90 px-3.5 py-2.5 shadow-sm ring-1 ring-slate-100 backdrop-blur">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-slate-950">
                    {firstEntry ? formatDay(firstEntry.createdAt) : key}
                    {firstEntry ? (
                      <span className="font-extrabold text-slate-400">
                        {" "}
                        • {formatShortDay(firstEntry.createdAt)}
                      </span>
                    ) : null}
                  </h3>
                </div>

                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                  {dayEntries.length} ghi nhận
                </span>
              </div>

              <div className="relative space-y-2.5 pl-1.5">
                {shouldShowTimelineLine ? (
                  <div className="absolute bottom-6 left-7 top-4 w-px bg-slate-100" />
                ) : null}

                {dayEntries.map((entry, index) => {
                  const tone = getTone(entry.type);
                  const babyName = getBabyDisplayName(
                    babyProfiles,
                    entry.babyId,
                  );
                  const avatarSrc = getBabyAvatarSrc(
                    babyProfiles,
                    entry.babyId,
                  );
                  const avatarEmoji = getBabyAvatarEmoji(
                    babyProfiles,
                    entry.babyId,
                  );
                  const secondaryNote = getSecondaryNote(entry);

                  return (
                    <article
                      key={entry.id}
                      className={`relative overflow-hidden rounded-4xl border-l-4 ${tone.border} bg-white p-3.5 shadow-sm ring-1 ring-slate-100 transition active:scale-[0.995]`}
                    >
                      {shouldShowTimelineLine ? (
                        <div
                          className={`absolute -left-[0.72rem] top-6 size-3 rounded-full ${tone.dot} ring-4 ring-white`}
                        />
                      ) : null}

                      <div className="flex items-start gap-3">
                        <div
                          className={`flex size-12 shrink-0 items-center justify-center rounded-3xl ${tone.iconBg} text-2xl ring-1 ${tone.iconRing}`}
                        >
                          {getTrackingIcon(entry.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${tone.chip}`}
                                >
                                  {getEntryTitle(entry)}
                                </span>
                                <span className="text-[12px] font-black text-slate-400">
                                  {formatTime(entry.createdAt)}
                                </span>
                              </div>

                              <p className="mt-2 text-base font-black leading-tight text-slate-950">
                                {formatValue(entry)}
                              </p>

                              {secondaryNote ? (
                                <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                                  {secondaryNote}
                                </p>
                              ) : null}
                            </div>

                            <button
                              type="button"
                              aria-label="Mở thao tác ghi nhận"
                              onClick={() => setSelectedEntry(entry)}
                              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-lg font-black text-slate-400 ring-1 ring-slate-100 transition active:scale-95"
                            >
                              ⋯
                            </button>
                          </div>

                          <div
                            className={`mt-3 inline-flex max-w-full items-center gap-2 rounded-full px-2.5 py-1.5 ring-1 ${tone.chip}`}
                          >
                            <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/80 text-xs font-black">
                              {avatarSrc ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={avatarSrc}
                                  alt={babyName}
                                  className="size-full object-cover"
                                />
                              ) : avatarEmoji ? (
                                <span>{avatarEmoji}</span>
                              ) : (
                                <span>
                                  {getBabyInitial(babyProfiles, entry.babyId)}
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs font-black">
                              {babyName}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`pointer-events-none absolute -bottom-10 -right-8 size-24 rounded-full ${tone.softBg}`}
                      />
                    </article>
                  );
                })}
              </div>

              <div className="rounded-4xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-xl ring-1 ring-purple-100">
                    🤖
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-500">
                      Insight hôm nay
                    </p>
                    <p className="mt-1 text-sm font-bold leading-6 text-slate-600">
                      {getDailyInsight(dayEntries, babyProfiles)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {selectedEntry ? (
        <div className="fixed inset-0 z-[160]">
          <button
            type="button"
            aria-label="Đóng menu thao tác"
            onClick={closeActionMenu}
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
          />

          <div className="absolute inset-x-3 bottom-3 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-4xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl ring-1 ring-slate-100 sm:left-1/2 sm:right-auto sm:bottom-auto sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:pb-4">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

            <div className="rounded-3xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                    getTone(selectedEntry.type).iconBg
                  } text-2xl ring-1 ${getTone(selectedEntry.type).iconRing}`}
                >
                  {getTrackingIcon(selectedEntry.type)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950">
                    {getEntryTitle(selectedEntry)} {formatValue(selectedEntry)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {formatTime(selectedEntry.createdAt)} •{" "}
                    {getBabyDisplayName(babyProfiles, selectedEntry.babyId)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={handleEdit}
                className="flex w-full items-center justify-between rounded-2xl bg-purple-50 px-4 py-4 text-left text-sm font-black text-purple-500 transition active:scale-[0.99]"
              >
                <span>✏️ Sửa ghi nhận</span>
                <span>›</span>
              </button>

              <button
                type="button"
                onClick={handleDuplicate}
                className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 text-left text-sm font-black text-slate-600 transition active:scale-[0.99]"
              >
                <span>📋 Nhân bản ghi nhận</span>
                <span>›</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="flex w-full items-center justify-between rounded-2xl bg-rose-50 px-4 py-4 text-left text-sm font-black text-rose-500 transition active:scale-[0.99]"
              >
                <span>🗑 Xóa ghi nhận</span>
                <span>›</span>
              </button>

              <button
                type="button"
                onClick={closeActionMenu}
                className="mt-2 w-full rounded-2xl bg-white px-4 py-4 text-sm font-black text-slate-500 ring-1 ring-slate-100 transition active:scale-[0.99]"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
