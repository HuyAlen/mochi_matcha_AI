"use client";

import { useMemo, useState } from "react";
import { babies } from "@/src/store/babyStore";
import { getTrackingIcon, getTrackingLabel } from "@/src/store/trackingStore";
import type { TrackingEntry } from "@/types/tracking";

interface RecentTrackingListProps {
  entries: TrackingEntry[];
  onEdit: (entry: TrackingEntry) => void;
  onDelete: (entryId: string) => void;
  onDuplicate: (entryId: string) => void;
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
  });
}

function formatValue(entry: TrackingEntry) {
  if (entry.type === "temperature") return `${entry.value}${entry.unit ?? ""}`;
  if (entry.type === "mood") return entry.note || "Ghi nhận tâm trạng";

  const value = Number(entry.value ?? 0);
  const unit = entry.unit ?? "";

  if (entry.type === "meal") {
    return unit ? `${value} ${unit}` : `${value} bữa`;
  }

  return `${value} ${unit}`.trim();
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
      <div className="rounded-[2rem] bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
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

          return (
            <section key={key} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-slate-950">
                  {firstEntry ? formatDay(firstEntry.createdAt) : key}
                </h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  {dayEntries.length} ghi nhận
                </span>
              </div>

              <div className="space-y-3">
                {dayEntries.map((entry) => {
                  const baby = babies.find((item) => item.id === entry.babyId);

                  return (
                    <article
                      key={entry.id}
                      className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-slate-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl ring-1 ring-pink-100">
                          {getTrackingIcon(entry.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-black text-slate-950">
                                {getTrackingLabel(entry.type)}{" "}
                                {formatValue(entry)}
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-400">
                                {formatTime(entry.createdAt)} •{" "}
                                {baby?.name ?? "Bé"}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-xl">
                                {baby?.avatarEmoji}
                              </span>
                              <button
                                type="button"
                                aria-label="Mở thao tác ghi nhận"
                                onClick={() => setSelectedEntry(entry)}
                                className="flex size-9 items-center justify-center rounded-full bg-slate-50 text-lg font-black text-slate-400 ring-1 ring-slate-100 transition active:scale-95"
                              >
                                ⋯
                              </button>
                            </div>
                          </div>

                          {entry.note && entry.type !== "mood" ? (
                            <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-5 text-slate-500">
                              {entry.note}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
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

          <div className="absolute inset-x-3 bottom-3 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[2rem] bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl ring-1 ring-slate-100 sm:left-1/2 sm:right-auto sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:pb-4">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

            <div className="rounded-[1.5rem] bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl ring-1 ring-pink-100">
                  {getTrackingIcon(selectedEntry.type)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-black text-slate-950">
                    {getTrackingLabel(selectedEntry.type)}{" "}
                    {formatValue(selectedEntry)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {formatTime(selectedEntry.createdAt)} •{" "}
                    {babies.find((item) => item.id === selectedEntry.babyId)
                      ?.name ?? "Bé"}
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
