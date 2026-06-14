"use client";

import {
  Baby as BabyIcon,
  CheckCircle2,
  HeartPulse,
  RotateCcw,
  Syringe,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Baby as AppBaby } from "@/types/baby";
import { calculateBabyAge, useBabyStore } from "@/store/babyStore";
import { useVaccineStore } from "@/store/vaccineStore";
import {
  compareTwinVaccineStatus,
  getNextVaccines,
  getStatusLabel,
  getVaccineStatusForBaby,
} from "@/services/vaccine/vaccineCalculator";
import type { VaccineDoseStatus, VaccineStatusItem } from "@/types/vaccine";

type BabyLite = AppBaby;

type BabyFilter = "all" | string;

type VaccineDisplayItem = VaccineStatusItem & {
  babyId: string;
  babyName: string;
  babyAvatar?: string;
};

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function getBabyName(baby: BabyLite) {
  return baby.nickname || baby.name || "Bé";
}

function getBabyAvatar(baby: BabyLite) {
  return baby.avatar || "👶";
}

export default function VaccinesPage() {
  const isClient = useIsClient();
  const { babies, activeBaby, activeBabyId, setActiveBabyId } = useBabyStore();
  const {
    records,
    markVaccineCompleted,
    undoVaccineCompleted,
    resetVaccineRecords,
  } = useVaccineStore();

  const babyList = babies;
  const initialFilter = activeBabyId || babyList[0]?.id || "all";
  const [selectedBabyId, setSelectedBabyId] =
    useState<BabyFilter>(initialFilter);

  const selectedBabies = useMemo(() => {
    if (selectedBabyId === "all") return babyList;
    return babyList.filter((baby) => baby.id === selectedBabyId);
  }, [babyList, selectedBabyId]);

  const allDisplayItems = useMemo<VaccineDisplayItem[]>(() => {
    return selectedBabies.flatMap((baby) =>
      getVaccineStatusForBaby(baby, records).map((item) => ({
        ...item,
        babyId: baby.id,
        babyName: getBabyName(baby),
        babyAvatar: getBabyAvatar(baby),
      })),
    );
  }, [records, selectedBabies]);

  const nextVaccines = useMemo<VaccineDisplayItem[]>(() => {
    return selectedBabies.flatMap((baby) =>
      getNextVaccines(baby, records, 2).map((item) => ({
        ...item,
        babyId: baby.id,
        babyName: getBabyName(baby),
        babyAvatar: getBabyAvatar(baby),
      })),
    );
  }, [records, selectedBabies]);

  const completedCount = allDisplayItems.filter(
    (item) => item.status === "completed",
  ).length;
  const overdueCount = allDisplayItems.filter(
    (item) => item.status === "overdue",
  ).length;
  const dueCount = allDisplayItems.filter(
    (item) => item.status === "due",
  ).length;
  const totalCount = allDisplayItems.length || 1;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const twinSummary =
    babyList[0] && babyList[1]
      ? compareTwinVaccineStatus(babyList[0], babyList[1], records)
      : null;

  const groupedItems = useMemo(() => {
    const priority = {
      overdue: 0,
      due: 1,
      upcoming: 2,
      completed: 3,
    } as Record<VaccineDoseStatus, number>;

    return [...allDisplayItems].sort((a, b) => {
      const statusDiff = priority[a.status] - priority[b.status];
      if (statusDiff !== 0) return statusDiff;
      return a.daysUntilDue - b.daysUntilDue;
    });
  }, [allDisplayItems]);

  if (!isClient || !activeBaby) {
    return (
      <main className="min-h-screen bg-[#fff7fb]">
        <div className="mx-auto min-h-screen w-full max-w-md bg-white" />
      </main>
    );
  }

  function handleBabyFilter(nextBabyId: BabyFilter) {
    setSelectedBabyId(nextBabyId);
    if (nextBabyId !== "all") setActiveBabyId(nextBabyId);
  }

  return (
    <main className="min-h-screen bg-[#fff7fb] text-slate-950">
      <div className="mx-auto min-h-screen w-full max-w-md bg-gradient-to-b from-[#fff7fb] via-white to-[#fff0f7] pb-28">
        <header className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500 px-5 pb-5 pt-5 text-white shadow-xl shadow-pink-200">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/20" />
          <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-white/15" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/85">Tiêm chủng</p>
              <h1 className="mt-1 text-2xl font-bold leading-tight">
                Lịch tiêm của bé
              </h1>
              <p className="mt-1 max-w-[280px] text-sm leading-6 text-white/82">
                Theo dõi mũi đã tiêm, sắp đến hạn và quá hạn cho từng bé.
              </p>
            </div>

            <button
              onClick={resetVaccineRecords}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur"
              title="Khôi phục dữ liệu mẫu"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="relative mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <FilterChip
              active={selectedBabyId === "all"}
              label="Cả hai bé"
              icon="👶"
              onClick={() => handleBabyFilter("all")}
            />

            {babyList.map((baby) => (
              <FilterChip
                key={baby.id}
                active={selectedBabyId === baby.id}
                label={getBabyName(baby)}
                icon={getBabyAvatar(baby)}
                subLabel={
                  baby.birthDate ? calculateBabyAge(baby.birthDate) : undefined
                }
                onClick={() => handleBabyFilter(baby.id)}
              />
            ))}
          </div>
        </header>

        <section className="space-y-5 px-4 pt-5">
          <section className="rounded-[2rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-rose-500">
                  Vaccine Score
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {completionRate}% hoàn thành
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Đã hoàn thành {completedCount}/{allDisplayItems.length} mũi
                  trong danh sách theo dõi.
                </p>
              </div>

              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-rose-50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-rose-600">
                    {completionRate}
                  </p>
                  <p className="text-[10px] font-semibold text-rose-400">%</p>
                </div>
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full bg-rose-50">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStatus
                label="Đã tiêm"
                value={completedCount}
                tone="emerald"
              />
              <MiniStatus label="Sắp hạn" value={dueCount} tone="amber" />
              <MiniStatus label="Quá hạn" value={overdueCount} tone="rose" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm shadow-amber-100">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <Bell size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-600">
                  Mũi sắp tới
                </p>
                <h2 className="text-lg font-bold">Cần theo dõi gần nhất</h2>
              </div>
            </div>

            <div className="space-y-3">
              {nextVaccines.length > 0 ? (
                nextVaccines.map((item) => (
                  <VaccineCard
                    key={`${item.babyId}-${item.id}`}
                    item={item}
                    compact
                    onComplete={() =>
                      markVaccineCompleted(item.babyId, item.id)
                    }
                    onUndo={() => undoVaccineCompleted(item.babyId, item.id)}
                  />
                ))
              ) : (
                <EmptyNotice
                  icon={<CheckCircle2 size={22} />}
                  title="Chưa có mũi cần nhắc"
                  description="Các mũi trong danh sách hiện tại đã được ghi nhận đầy đủ."
                />
              )}
            </div>
          </section>

          {twinSummary && selectedBabyId === "all" && (
            <section className="rounded-[2rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-rose-500">
                    Song sinh
                  </p>
                  <h2 className="text-lg font-bold">So sánh lịch tiêm</h2>
                </div>
                <BabyIcon size={22} className="text-rose-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TwinVaccineValue
                  label={getBabyName(babyList[0])}
                  value={`${twinSummary.completedA}/${twinSummary.total}`}
                />
                <TwinVaccineValue
                  label={getBabyName(babyList[1])}
                  value={`${twinSummary.completedB}/${twinSummary.total}`}
                />
              </div>

              <div
                className={`mt-4 rounded-2xl p-3 text-sm leading-6 ${
                  twinSummary.status === "watch"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {twinSummary.message}
              </div>
            </section>
          )}

          <section className="rounded-[2rem] border border-rose-100 bg-white p-4 shadow-sm shadow-rose-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-rose-500">
                  Toàn bộ lịch
                </p>
                <h2 className="text-lg font-bold">Danh sách mũi tiêm</h2>
              </div>

              <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-500">
                {groupedItems.length} mũi
              </div>
            </div>

            <div className="space-y-3">
              {groupedItems.length > 0 ? (
                groupedItems.map((item) => (
                  <VaccineCard
                    key={`${item.babyId}-${item.id}`}
                    item={item}
                    onComplete={() =>
                      markVaccineCompleted(item.babyId, item.id)
                    }
                    onUndo={() => undoVaccineCompleted(item.babyId, item.id)}
                  />
                ))
              ) : (
                <EmptyNotice
                  icon={<Syringe size={22} />}
                  title="Chưa có lịch tiêm"
                  description="Thêm bé hoặc khôi phục dữ liệu mẫu để bắt đầu theo dõi."
                />
              )}
            </div>
          </section>

          <section className="rounded-[2rem] bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500 p-4 text-white shadow-xl shadow-pink-200">
            <div className="flex items-start gap-3">
              <HeartPulse className="mt-0.5 shrink-0" size={22} />
              <div>
                <p className="font-bold">Lưu ý cho mẹ</p>
                <p className="mt-1 text-sm leading-6 text-white/90">
                  Lịch tiêm trong app chỉ dùng để nhắc nhở và quản lý cá nhân.
                  Mẹ nên đối chiếu với sổ tiêm chủng và tư vấn bác sĩ trước khi
                  tiêm.
                </p>
              </div>
            </div>
          </section>
        </section>

        <BottomNav />
      </div>
    </main>
  );
}

function FilterChip({
  active,
  label,
  icon,
  subLabel,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: string;
  subLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-w-max items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition ${
        active
          ? "bg-white text-slate-950 shadow-lg"
          : "bg-white/20 text-white backdrop-blur"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>
        <span className="block font-semibold">{label}</span>
        {subLabel && (
          <span
            className={`block text-[10px] ${
              active ? "text-slate-500" : "text-white/75"
            }`}
          >
            {subLabel}
          </span>
        )}
      </span>
    </button>
  );
}

function MiniStatus({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "rose";
}) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  }[tone];

  return (
    <div className={`rounded-2xl p-3 text-center ${toneClass}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] font-semibold">{label}</p>
    </div>
  );
}

function VaccineCard({
  item,
  onComplete,
  onUndo,
  compact = false,
}: {
  item: VaccineDisplayItem;
  onComplete: () => void;
  onUndo: () => void;
  compact?: boolean;
}) {
  const statusClass = getStatusClass(item.status);
  const isCompleted = item.status === "completed";

  return (
    <div className="rounded-3xl bg-rose-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">{item.name}</p>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass}`}
            >
              {getStatusLabel(item.status)}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-rose-500">
            <span>{item.dose}</span>
            <span>•</span>
            <span>
              {item.babyAvatar} {item.babyName}
            </span>
          </div>

          {!compact && (
            <>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.disease}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </>
          )}

          {!isCompleted && (
            <p
              className={`mt-3 flex items-center gap-1 text-xs font-bold ${
                item.status === "overdue" ? "text-rose-600" : "text-slate-500"
              }`}
            >
              {item.status === "overdue" && <AlertTriangle size={14} />}
              {item.daysUntilDue >= 0
                ? `Còn ${item.daysUntilDue} ngày đến hạn`
                : `Quá hạn ${Math.abs(item.daysUntilDue)} ngày`}
            </p>
          )}
        </div>

        <button
          onClick={isCompleted ? onUndo : onComplete}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isCompleted ? "bg-emerald-500 text-white" : "bg-white text-rose-500"
          }`}
          title={isCompleted ? "Bỏ đánh dấu đã tiêm" : "Đánh dấu đã tiêm"}
        >
          <CheckCircle2 size={20} />
        </button>
      </div>
    </div>
  );
}

function EmptyNotice({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl bg-white/70 p-4 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        {icon}
      </div>
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function TwinVaccineValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-rose-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-rose-600">{value}</p>
    </div>
  );
}

function getStatusClass(status: VaccineDoseStatus) {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "overdue") return "bg-rose-100 text-rose-700";
  if (status === "due") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}
