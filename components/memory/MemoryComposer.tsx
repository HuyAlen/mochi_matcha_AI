"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, useState } from "react";

import {
  babyScopeLabel,
  memoryTypeIcons,
  memoryTypeLabels,
} from "@/components/memory/MemoryFilters";
import { defaultMemoryDraft } from "@/store/memoryStore";
import type { MemoryBabyScope, MemoryDraft, MemoryType } from "@/types/memory";

const babyOptions: { label: string; value: MemoryBabyScope }[] = [
  { label: "Mochi", value: "mochi" },
  { label: "Matcha", value: "matcha" },
  { label: "Cả hai", value: "both" },
];

const memoryTypes: MemoryType[] = [
  "first_moment",
  "milestone",
  "photo",
  "note",
  "health",
  "family",
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Không đọc được ảnh."));
    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string" && result.startsWith("data:image")) {
        resolve(result);
        return;
      }

      reject(new Error("Ảnh không hợp lệ."));
    };

    reader.readAsDataURL(file);
  });
}

function compressImageDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onerror = () => resolve(dataUrl);
    image.onload = () => {
      const maxSize = 960;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };

    image.src = dataUrl;
  });
}

export default function MemoryComposer({
  onAdd,
}: {
  onAdd: (draft: MemoryDraft) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<MemoryDraft>({
    ...defaultMemoryDraft,
    date: new Date().toISOString().slice(0, 10),
  });

  function updateDraft<K extends keyof MemoryDraft>(
    key: K,
    value: MemoryDraft[K],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !file.type.startsWith("image/")) return;

    const rawPhotoUrl = await readFileAsDataUrl(file);
    updateDraft("photoUrl", rawPhotoUrl);

    const compressedPhotoUrl = await compressImageDataUrl(rawPhotoUrl);
    updateDraft("photoUrl", compressedPhotoUrl);
  }

  function closeSheet() {
    setIsOpen(false);
  }

  function handleSubmit() {
    if (!draft.title.trim()) return;

    onAdd(draft);
    setDraft({
      ...defaultMemoryDraft,
      date: new Date().toISOString().slice(0, 10),
    });
    closeSheet();
  }

  return (
    <>
      <section className="rounded-4xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-3xl bg-pink-500 px-5 py-4 text-left text-white shadow-sm shadow-pink-200"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-100">
              New Memory
            </p>
            <h3 className="mt-1 text-lg font-black">Tạo kỷ niệm mới</h3>
          </div>
          <span className="text-2xl">+</span>
        </button>
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Đóng"
            onClick={closeSheet}
            className="absolute inset-0 cursor-default"
          />

          <section className="relative z-10 flex max-h-[86dvh] w-full max-w-3xl flex-col overflow-hidden rounded-4xl bg-white shadow-2xl">
            <div className="shrink-0 border-b border-pink-100 bg-white px-5 pb-4 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-400">
                    New Memory
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    Thêm kỷ niệm mới
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeSheet}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-lg font-black text-pink-500"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-2">
                  {babyOptions.map((option) => {
                    const active = draft.babyId === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateDraft("babyId", option.value)}
                        className={[
                          "rounded-2xl px-3 py-3 text-sm font-black transition",
                          active
                            ? "bg-pink-500 text-white"
                            : "bg-pink-50 text-slate-500",
                        ].join(" ")}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {memoryTypes.map((type) => {
                    const active = draft.type === type;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateDraft("type", type)}
                        className={[
                          "min-h-12 rounded-2xl px-2 py-2 text-xs font-black leading-4 transition",
                          active
                            ? "bg-fuchsia-500 text-white"
                            : "bg-fuchsia-50 text-slate-500",
                        ].join(" ")}
                      >
                        <span className="mr-1">{memoryTypeIcons[type]}</span>
                        {memoryTypeLabels[type].replace("Khoảnh khắc ", "")}
                      </button>
                    );
                  })}
                </div>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Tiêu đề
                  </span>
                  <input
                    value={draft.title}
                    onChange={(event) =>
                      updateDraft("title", event.target.value)
                    }
                    placeholder="Ví dụ: Lần đầu Mochi tự ngồi"
                    className="w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-pink-300 focus:bg-white"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Ngày xảy ra
                  </span>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(event) =>
                      updateDraft("date", event.target.value)
                    }
                    className="w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-pink-300 focus:bg-white"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Ghi chú
                  </span>
                  <textarea
                    value={draft.note}
                    onChange={(event) =>
                      updateDraft("note", event.target.value)
                    }
                    rows={3}
                    placeholder={`Khoảnh khắc này của ${babyScopeLabel(
                      draft.babyId,
                    )} có gì đáng nhớ?`}
                    className="w-full resize-none rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-sm font-bold leading-6 text-slate-800 outline-none focus:border-pink-300 focus:bg-white"
                  />
                </label>

                {draft.photoUrl ? (
                  <div className="relative overflow-hidden rounded-3xl">
                    <img
                      src={draft.photoUrl}
                      alt={draft.title || "Memory photo"}
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => updateDraft("photoUrl", "")}
                      className="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-black text-pink-500 shadow-sm"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-pink-200 bg-pink-50/50 px-4 py-8 text-center">
                    <span className="text-3xl">📷</span>
                    <span className="mt-2 text-sm font-black text-pink-500">
                      Thêm ảnh kỷ niệm
                    </span>
                    <span className="mt-1 text-xs font-medium text-slate-400">
                      JPG, PNG, WEBP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}

                <label className="flex items-center justify-between rounded-2xl bg-pink-50 px-4 py-3">
                  <span className="text-sm font-black text-slate-700">
                    Đánh dấu yêu thích
                  </span>
                  <input
                    type="checkbox"
                    checked={draft.isFavorite}
                    onChange={(event) =>
                      updateDraft("isFavorite", event.target.checked)
                    }
                    className="h-5 w-5 accent-pink-500"
                  />
                </label>
              </div>
            </div>

            <div className="shrink-0 border-t border-pink-100 bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeSheet}
                  className="rounded-2xl bg-white px-4 py-4 text-sm font-black text-slate-500 shadow-sm ring-1 ring-pink-100"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!draft.title.trim()}
                  className="rounded-2xl bg-pink-500 px-4 py-4 text-sm font-black text-white shadow-sm shadow-pink-200 disabled:opacity-50"
                >
                  Lưu kỷ niệm
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
