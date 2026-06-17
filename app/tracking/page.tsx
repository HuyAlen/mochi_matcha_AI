"use client";

import { useState } from "react";
import ActivityDetailForm from "@/components/tracking/ActivityDetailForm";
import AddActivitySheet from "@/components/tracking/AddActivitySheet";
import BabySelector from "@/components/tracking/BabySelector";
import NotificationPermissionCard from "@/components/tracking/NotificationPermissionCard";
import QuickActionGrid from "@/components/tracking/QuickActionGrid";
import RecentTrackingList from "@/components/tracking/RecentTrackingList";
import ReminderCard from "@/components/tracking/ReminderCard";
import AppShell from "@/components/layout/AppShell";
import { babies } from "@/src/store/babyStore";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";
import type {
  TrackingEntry,
  TrackingTodaySummary,
  TrackingType,
} from "@/types/tracking";

function DailySummaryCard({
  selectedBabyId,
  summary,
}: {
  selectedBabyId: BabyId;
  summary: TrackingTodaySummary;
}) {
  const baby = babies.find((item) => item.id === selectedBabyId) ?? babies[0];

  const items = [
    { label: "Sữa", value: `${summary.milkMl} ml`, icon: "🍼" },
    {
      label: "Ngủ",
      value: `${Number(summary.sleepHours.toFixed(1))} giờ`,
      icon: "😴",
    },
    { label: "Ăn", value: `${summary.meals} bữa`, icon: "🥣" },
    { label: "Tã", value: `${summary.diapers} lần`, icon: "🧷" },
  ];

  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-pink-50 via-white to-purple-50 p-5 shadow-sm ring-1 ring-pink-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
            Tổng quan hôm nay
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-950">
            {baby.avatarEmoji} {baby.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Dữ liệu được lưu trên thiết bị bằng localStorage.
          </p>
        </div>

        {summary.temperatureLatest ? (
          <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-bold text-slate-400">Nhiệt độ</p>
            <p className="font-black text-pink-600">
              {summary.temperatureLatest}°C
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="mt-3 text-xs font-bold text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const [selectedBabyId, setSelectedBabyId] = useState<BabyId>("mochi");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TrackingType | null>(null);

  const entries = useTrackingStore((state) => state.entries);
  const addEntry = useTrackingStore((state) => state.addEntry);
  const getTodaySummary = useTrackingStore((state) => state.getTodaySummary);

  const todaySummary = getTodaySummary(selectedBabyId);
  const selectedEntries = entries.filter(
    (entry) => entry.babyId === selectedBabyId,
  );

  function saveEntry(entry: Omit<TrackingEntry, "id" | "createdAt">) {
    addEntry(entry);
    setSelectedType(null);
    setSheetOpen(false);
  }

  return (
    <AppShell>
      <section className="space-y-4 pb-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
            Tracking UX Pro
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Ghi nhận nhanh
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Chọn bé và lưu hoạt động chăm sóc hằng ngày chỉ trong vài giây.
          </p>
        </div>

        <BabySelector
          selectedBabyId={selectedBabyId}
          onChange={setSelectedBabyId}
        />

        <NotificationPermissionCard />

        <DailySummaryCard
          selectedBabyId={selectedBabyId}
          summary={todaySummary}
        />

        <QuickActionGrid
          selectedBabyId={selectedBabyId}
          onAddEntry={addEntry}
        />

        <RecentTrackingList
          entries={selectedEntries}
          selectedBabyId={selectedBabyId}
        />

        <ReminderCard />
      </section>

      <AddActivitySheet
        open={sheetOpen}
        selectedBabyId={selectedBabyId}
        onBabyChange={setSelectedBabyId}
        onClose={() => setSheetOpen(false)}
        onSelectActivity={(type: TrackingType) => {
          setSelectedType(type);
          setSheetOpen(false);
        }}
      />

      {selectedType ? (
        <ActivityDetailForm
          type={selectedType}
          babyId={selectedBabyId}
          onBack={() => {
            setSelectedType(null);
            setSheetOpen(true);
          }}
          onSave={saveEntry}
        />
      ) : null}
    </AppShell>
  );
}
