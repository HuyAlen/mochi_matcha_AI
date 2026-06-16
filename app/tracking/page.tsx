"use client";

import { useState } from "react";
import ActivityDetailForm from "@/components/tracking/ActivityDetailForm";
import AddActivitySheet from "@/components/tracking/AddActivitySheet";
import BabySelector from "@/components/tracking/BabySelector";
import FloatingAddButton from "@/components/tracking/FloatingAddButton";
import QuickActionGrid from "@/components/tracking/QuickActionGrid";
import RecentTrackingList from "@/components/tracking/RecentTrackingList";
import ReminderCard from "@/components/tracking/ReminderCard";
import TodayCalendarCard from "@/components/tracking/TodayCalendarCard";
import AppShell from "@/components/layout/AppShell";
import { useTrackingStore } from "@/src/store/trackingStore";
import type { BabyId } from "@/types/baby";
import type { TrackingEntry, TrackingType } from "@/types/tracking";

export default function TrackingPage() {
  const [selectedBabyId, setSelectedBabyId] = useState<BabyId>("mochi");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TrackingType | null>(null);

  const addEntry = useTrackingStore(
    (state: {
      addEntry: (entry: Omit<TrackingEntry, "id" | "createdAt">) => void;
    }) => state.addEntry,
  );

  const entries = useTrackingStore(
    (state: { entries: TrackingEntry[] }) => state.entries,
  );

  function saveEntry(entry: Omit<TrackingEntry, "id" | "createdAt">) {
    addEntry(entry);
    setSelectedType(null);
    setSheetOpen(false);
  }

  return (
    <AppShell>
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ghi nhận nhanh</h2>
          <p className="mt-1 text-sm text-slate-500">
            Chọn bé và lưu hoạt động chăm sóc hằng ngày.
          </p>
        </div>

        <BabySelector
          selectedBabyId={selectedBabyId}
          onChange={setSelectedBabyId}
        />

        <QuickActionGrid
          selectedBabyId={selectedBabyId}
          onAddEntry={addEntry}
        />

        <TodayCalendarCard />

        <RecentTrackingList entries={entries} />

        <ReminderCard />
      </section>

      <FloatingAddButton onClick={() => setSheetOpen(true)} />

      <AddActivitySheet
        open={sheetOpen}
        selectedBabyId={selectedBabyId}
        onBabyChange={setSelectedBabyId}
        onClose={() => setSheetOpen(false)}
        onSelectActivity={(type) => {
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
