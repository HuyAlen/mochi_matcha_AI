"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import GrowthEntrySheet from "@/components/growth/GrowthEntrySheet";
import type { Baby, BabyId } from "@/types/baby";
import type { GrowthRecord } from "@/types/growth";

type GrowthDraft = {
  date: string;
  weightKg: string;
  heightCm: string;
  headCircumferenceCm: string;
};

interface GrowthEntryManagerProps {
  baby: Baby;
  babyId: BabyId;
  records: GrowthRecord[];
  onAdd: (record: Omit<GrowthRecord, "id">) => void;
  onUpdate: (id: string, data: Partial<Omit<GrowthRecord, "id">>) => void;
  onDelete: (id: string) => void;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function createEmptyDraft(record?: GrowthRecord): GrowthDraft {
  return {
    date: record?.date ?? todayISO(),
    weightKg: record ? String(record.weightKg) : "",
    heightCm: record ? String(record.heightCm) : "",
    headCircumferenceCm: record ? String(record.headCircumferenceCm) : "",
  };
}

function toNumber(value: string) {
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

export default function GrowthEntryManager({
  baby,
  babyId,
  records,
  onAdd,
  onUpdate,
  onDelete,
}: GrowthEntryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GrowthRecord | null>(null);
  const [draft, setDraft] = useState<GrowthDraft>(() => createEmptyDraft());
  const [isSaving, setIsSaving] = useState(false);

  const babyRecords = useMemo(
    () =>
      records
        .filter((record) => record.babyId === babyId)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [records, babyId],
  );

  const latestRecords = babyRecords.slice(0, 4);
  const displayName = baby.nickname || baby.name;

  function updateDraft<K extends keyof GrowthDraft>(
    key: K,
    value: GrowthDraft[K],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openAddSheet() {
    setEditingRecord(null);
    setDraft(createEmptyDraft(babyRecords[0]));
    setIsOpen(true);
  }

  function openEditSheet(record: GrowthRecord) {
    setEditingRecord(record);
    setDraft(createEmptyDraft(record));
    setIsOpen(true);
  }

  function closeSheet() {
    if (isSaving) return;

    setIsOpen(false);
    setEditingRecord(null);
    setDraft(createEmptyDraft());
  }

  function handleSubmit() {
    if (isSaving) return;

    const payload = {
      babyId,
      date: draft.date || todayISO(),
      weightKg: toNumber(draft.weightKg),
      heightCm: toNumber(draft.heightCm),
      headCircumferenceCm: toNumber(draft.headCircumferenceCm),
    };

    if (
      payload.weightKg <= 0 ||
      payload.heightCm <= 0 ||
      payload.headCircumferenceCm <= 0
    ) {
      return;
    }

    setIsSaving(true);

    if (editingRecord) {
      onUpdate(editingRecord.id, payload);
    } else {
      onAdd(payload);
    }

    if (typeof window !== "undefined") {
      window.navigator.vibrate?.(20);
    }

    setIsSaving(false);
    closeSheet();
  }

  return (
    <>
      <section className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-400">
              Measurement
            </p>
            <h3 className="mt-1 text-lg font-black text-slate-950">
              Nhật ký đo của {displayName}
            </h3>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
              Thêm, sửa hoặc xóa chỉ số để biểu đồ và AI Insight cập nhật ngay.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddSheet}
            className="shrink-0 rounded-2xl bg-pink-500 px-4 py-3 text-sm font-black text-white shadow-sm shadow-pink-200"
          >
            + Thêm
          </button>
        </div>

        {latestRecords.length > 0 ? (
          <div className="mt-4 space-y-3">
            {latestRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-3xl bg-pink-50/50 p-4 ring-1 ring-pink-100"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-950">
                    {formatDate(record.date)}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditSheet(record)}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-pink-500 shadow-sm"
                    >
                      Sửa
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(record.id)}
                      className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-500"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-white p-3 text-center">
                    <p className="font-black text-slate-950">
                      {record.weightKg}kg
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">
                      Cân nặng
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-3 text-center">
                    <p className="font-black text-slate-950">
                      {record.heightCm}cm
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">
                      Chiều cao
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-3 text-center">
                    <p className="font-black text-slate-950">
                      {record.headCircumferenceCm}cm
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">
                      Vòng đầu
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-3xl bg-pink-50/60 p-5 text-center">
            <p className="text-3xl">📏</p>
            <p className="mt-2 text-sm font-black text-slate-950">
              Chưa có chỉ số tăng trưởng
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
              Thêm lần đo đầu tiên để bắt đầu theo dõi xu hướng.
            </p>
          </div>
        )}
      </section>

      {isOpen
        ? createPortal(
            <div className="fixed left-0 top-0 z-[9999] h-[100dvh] w-screen bg-black/45 backdrop-blur-sm">
              <button
                type="button"
                aria-label="Đóng"
                onClick={closeSheet}
                className="absolute inset-0 cursor-default"
              />

              <div className="absolute inset-0 flex items-center justify-center px-5 py-6">
                <section className="relative z-10 max-h-[calc(100dvh-48px)] w-full max-w-[480px] overflow-y-auto rounded-[1.75rem] bg-white p-5 shadow-2xl">
                  <GrowthEntrySheet
                    displayName={displayName}
                    draft={draft}
                    isEditing={Boolean(editingRecord)}
                    isSaving={isSaving}
                    onClose={closeSheet}
                    onSave={handleSubmit}
                    onChange={updateDraft}
                  />
                </section>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
