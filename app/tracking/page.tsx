"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import ActivityDetailForm from "@/components/tracking/ActivityDetailForm";
import ActivitySheetRouter from "@/components/tracking/sheets/ActivitySheetRouter";
import RecentTrackingList from "@/components/tracking/RecentTrackingList";
import AppShell from "@/components/layout/AppShell";
import { useBabyStore } from "@/src/store/babyStore";
import {
  getTrackingIcon,
  getTrackingLabel,
  summarizeTrackingEntries,
  useTrackingStore,
} from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry, TrackingType } from "@/types/tracking";

type BabyFilter = BabyId | "all";
type DateFilter = "today" | "7d" | "30d" | "all";
type TypeFilter = TrackingType | "all";

function getBabyDisplayName(baby: { name?: string; nickname?: string }) {
  return baby.nickname?.trim() || baby.name?.trim() || "Bé";
}

function getBabyAvatar(baby: { avatarEmoji?: string }) {
  return baby.avatarEmoji?.trim() || "👶";
}

const quickTypes = [
  "milk",
  "sleep",
  "meal",
  "diaper",
  "temperature",
  "medicine",
] as const satisfies readonly TrackingType[];

function normalizeQuickType(value: string | null): TrackingType | null {
  if (!value) return null;
  return quickTypes.includes(value as (typeof quickTypes)[number])
    ? (value as TrackingType)
    : null;
}

function normalizeBabyId(value: string | null): BabyId | null {
  if (value === "mochi" || value === "matcha") return value;
  return null;
}

type ToastState = {
  message: string;
  tone: "success" | "error";
};

const dateFilters: { label: string; value: DateFilter }[] = [
  { label: "Hôm nay", value: "today" },
  { label: "7 ngày", value: "7d" },
  { label: "30 ngày", value: "30d" },
  { label: "Tất cả", value: "all" },
];

const typeFilters: { label: string; value: TypeFilter; icon?: string }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Sữa", value: "milk", icon: "🍼" },
  { label: "Ngủ", value: "sleep", icon: "😴" },
  { label: "Ăn", value: "meal", icon: "🥣" },
  { label: "Tã", value: "diaper", icon: "🧷" },
  { label: "Thuốc", value: "medicine", icon: "💊" },
  { label: "Sốt", value: "temperature", icon: "🌡️" },
  { label: "Mood", value: "mood", icon: "😊" },
];

function isInDateRange(date: string, filter: DateFilter) {
  if (filter === "all") return true;

  const input = new Date(date);
  const now = new Date();
  const start = new Date(now);

  if (filter === "today") {
    return (
      input.getDate() === now.getDate() &&
      input.getMonth() === now.getMonth() &&
      input.getFullYear() === now.getFullYear()
    );
  }

  start.setDate(now.getDate() - (filter === "7d" ? 6 : 29));
  start.setHours(0, 0, 0, 0);

  return input.getTime() >= start.getTime();
}

function todayLabel() {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

function getTypeToastLabel(type: TrackingType) {
  const labels: Record<TrackingType, string> = {
    milk: "cữ sữa",
    sleep: "giấc ngủ",
    meal: "bữa ăn",
    diaper: "lần thay tã",
    temperature: "nhiệt độ",
    medicine: "lần uống thuốc",
    mood: "tâm trạng",
  };

  return labels[type] ?? "ghi nhận";
}

function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;

  return (
    <div className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-md rounded-3xl bg-white px-4 py-3 shadow-xl ring-1 ring-pink-100">
      <p
        className={`text-sm font-black ${
          toast.tone === "success" ? "text-pink-600" : "text-rose-600"
        }`}
      >
        {toast.message}
      </p>
    </div>
  );
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-2xl px-3 py-2.5 text-xs font-black transition active:scale-[0.98] ${
        active
          ? "bg-pink-500 text-white shadow-sm shadow-pink-100"
          : "bg-slate-50 text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

function CompactSelect({
  label,
  value,
  children,
  onChange,
}: {
  label: string;
  value: string;
  children: ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-3xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
      <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full bg-transparent text-sm font-black text-slate-800 outline-none"
      >
        {children}
      </select>
    </label>
  );
}

function SmartSummary({ entries }: { entries: TrackingEntry[] }) {
  const summary = summarizeTrackingEntries(entries);
  const items = [
    { label: "Sữa", value: `${summary.milkMl}ml`, icon: "🍼" },
    {
      label: "Ngủ",
      value: `${Number(summary.sleepHours.toFixed(1))}h`,
      icon: "😴",
    },
    { label: "Ăn", value: `${summary.meals} bữa`, icon: "🥣" },
    { label: "Tã", value: `${summary.diapers} lần`, icon: "🧷" },
  ];

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
            Smart summary
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            Tổng quan theo bộ lọc
          </h2>
        </div>
        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-500">
          {entries.length} ghi nhận
        </span>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl bg-slate-50 p-3 text-center"
          >
            <div className="text-2xl">{item.icon}</div>
            <p className="mt-2 text-[11px] font-bold text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AIInsightMini({ entries }: { entries: TrackingEntry[] }) {
  const summary = summarizeTrackingEntries(entries);
  const hasData = entries.length > 0;

  const insight = !hasData
    ? "Chưa có dữ liệu theo bộ lọc hiện tại. Khi có thêm ghi nhận, Mind AI sẽ tóm tắt xu hướng chăm bé tại đây."
    : summary.sleepHours < 2 && summary.milkMl > 0
      ? "Bé đã có cữ sữa nhưng thời lượng ngủ trong bộ lọc còn thấp. Nên theo dõi thêm giấc ngủ kế tiếp."
      : summary.meals >= 3
        ? "Lịch ăn hôm nay khá đầy đủ. Có thể ghi chú món ăn để theo dõi phản ứng và sở thích của bé."
        : "Dữ liệu đang ổn định. Tiếp tục ghi nhận đều sữa, ngủ, ăn và tã để Mind AI phân tích chính xác hơn.";

  return (
    <section className="rounded-[2rem] bg-gradient-to-br from-purple-50 via-white to-pink-50 p-5 shadow-sm ring-1 ring-purple-100">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-purple-100">
          🤖
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-slate-950">AI Insight mini</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{insight}</p>
        </div>
      </div>
    </section>
  );
}

function TrackingPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const quickType = normalizeQuickType(searchParams.get("quick"));
  const queryBabyId = normalizeBabyId(
    searchParams.get("babyId") || searchParams.get("baby"),
  );

  const [babyFilter, setBabyFilter] = useState<BabyFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedBabyId, setSelectedBabyId] = useState<BabyId>("mochi");
  const [selectedType, setSelectedType] = useState<TrackingType | null>(null);
  const [editingEntry, setEditingEntry] = useState<TrackingEntry | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const babyProfiles = useBabyStore((state) => state.babyProfiles);
  const entries = useTrackingStore((state) => state.entries);
  const addEntry = useTrackingStore((state) => state.addEntry);
  const updateEntry = useTrackingStore((state) => state.updateEntry);
  const duplicateEntry = useTrackingStore((state) => state.duplicateEntry);
  const deleteEntry = useTrackingStore((state) => state.deleteEntry);

  const effectiveSelectedBabyId = queryBabyId ?? selectedBabyId;

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchBaby =
        babyFilter === "all" ? true : entry.babyId === babyFilter;
      const matchType = typeFilter === "all" ? true : entry.type === typeFilter;
      const matchDate = isInDateRange(entry.createdAt, dateFilter);

      return matchBaby && matchType && matchDate;
    });
  }, [babyFilter, dateFilter, entries, typeFilter]);

  function closeQuickSheet() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("quick");
    params.delete("baby");
    params.delete("babyId");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  function handleQuickBabyChange(nextBabyId: BabyId) {
    setSelectedBabyId(nextBabyId);

    if (!quickType) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("quick", quickType);
    params.set("baby", nextBabyId);
    params.set("babyId", nextBabyId);

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  }

  function showToast(nextToast: ToastState) {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2200);
  }

  function handleSave(entry: Omit<TrackingEntry, "id" | "createdAt">) {
    if (editingEntry) {
      updateEntry(editingEntry.id, entry);
      setEditingEntry(null);
      setSelectedType(null);
      showToast({ tone: "success", message: "✅ Đã cập nhật ghi nhận" });
      return;
    }

    addEntry(entry);
    setSelectedType(null);
    if (quickType) closeQuickSheet();
    const baby =
      babyProfiles.find((item) => item.id === entry.babyId) ?? babyProfiles[0];
    showToast({
      tone: "success",
      message: `✅ Đã ghi nhận ${getTypeToastLabel(entry.type)} cho ${getBabyDisplayName(baby)}`,
    });
  }

  function handleEdit(entry: TrackingEntry) {
    setEditingEntry(entry);
    setSelectedBabyId(entry.babyId);
    setSelectedType(entry.type);
  }

  function handleDuplicate(entryId: string) {
    duplicateEntry(entryId);
    showToast({ tone: "success", message: "✅ Đã nhân bản ghi nhận" });
  }

  function handleDelete(entryId: string) {
    const confirmed = window.confirm("Bạn muốn xóa ghi nhận này?");
    if (!confirmed) return;

    deleteEntry(entryId);
    showToast({ tone: "success", message: "🗑 Đã xóa ghi nhận" });
  }

  return (
    <AppShell>
      <Toast toast={toast} />

      <section className="space-y-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <header className="rounded-[2rem] bg-gradient-to-br from-pink-50 via-white to-purple-50 p-5 shadow-sm ring-1 ring-pink-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
                Tracking Pro
              </p>
              <h1 className="mt-2 text-2xl font-black text-slate-950">
                Theo dõi chăm bé
              </h1>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {babyProfiles.map(getBabyDisplayName).join(" & ")} •{" "}
                {todayLabel()}
              </p>
            </div>
          </div>
        </header>

        <section className="sticky top-2 z-20 rounded-[2rem] bg-white/95 p-4 shadow-sm ring-1 ring-slate-100 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-400">
              Bộ lọc
            </p>
            <button
              type="button"
              onClick={() => {
                setBabyFilter("all");
                setDateFilter("today");
                setTypeFilter("all");
              }}
              className="rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-500"
            >
              Đặt lại
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 rounded-[1.5rem] bg-slate-50 p-1.5">
            <FilterPill
              active={babyFilter === "all"}
              onClick={() => setBabyFilter("all")}
            >
              Tất cả
            </FilterPill>
            {babyProfiles.map((baby) => (
              <FilterPill
                key={baby.id}
                active={babyFilter === baby.id}
                onClick={() => setBabyFilter(baby.id)}
              >
                {getBabyAvatar(baby)} {getBabyDisplayName(baby)}
              </FilterPill>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <CompactSelect
              label="Thời gian"
              value={dateFilter}
              onChange={(value) => setDateFilter(value as DateFilter)}
            >
              {dateFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </CompactSelect>

            <CompactSelect
              label="Hoạt động"
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as TypeFilter)}
            >
              {typeFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.icon ? `${filter.icon} ` : ""}
                  {filter.label}
                </option>
              ))}
            </CompactSelect>
          </div>
        </section>

        <SmartSummary entries={filteredEntries} />
        <AIInsightMini entries={filteredEntries} />

        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <h2 className="text-lg font-black text-slate-950">Timeline Pro</h2>
            <p className="text-xs font-bold text-slate-400">
              Nhóm theo ngày • Quản lý bằng menu tác vụ
            </p>
          </div>
          {typeFilter !== "all" ? (
            <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-500">
              {getTrackingIcon(typeFilter)} {getTrackingLabel(typeFilter)}
            </span>
          ) : null}
        </div>

        <RecentTrackingList
          entries={filteredEntries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      </section>

      {quickType && !editingEntry ? (
        <ActivitySheetRouter
          type={quickType}
          babyId={effectiveSelectedBabyId}
          onBabyChange={handleQuickBabyChange}
          onClose={closeQuickSheet}
          onSave={handleSave}
        />
      ) : null}

      {selectedType && editingEntry ? (
        <ActivityDetailForm
          type={selectedType}
          babyId={selectedBabyId}
          initialEntry={editingEntry}
          onBack={() => {
            setSelectedType(null);
            setEditingEntry(null);
          }}
          onSave={handleSave}
        />
      ) : null}
    </AppShell>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={null}>
      <TrackingPageContent />
    </Suspense>
  );
}
