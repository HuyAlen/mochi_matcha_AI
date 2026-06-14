"use client";

import { CalendarDays, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { useBabyStore } from "@/store/babyStore";
import {
  formatLogDate,
  formatLogTime,
  trackingMeta,
  useTrackingStore,
} from "@/store/trackingStore";
import type { TrackingLog } from "@/types/tracking";

export default function TimelinePage() {
  const { babies, activeBabyId, setActiveBabyId } = useBabyStore();
  const { logs, deleteTrackingLog } = useTrackingStore();
  const filteredLogs = logs.filter((log) => log.babyId === activeBabyId);
  const groupedLogs = groupLogsByDate(filteredLogs);

  return (
    <main className="min-h-screen bg-[#fff7fb] text-slate-950">
      <div className="mx-auto min-h-screen w-full max-w-md bg-linear-to-b from-[#fff7fb] via-white to-[#fff1f7] pb-28">
        <header className="rounded-b-4xl bg-linear-to-br from-pink-500 via-rose-500 to-fuchsia-500 px-5 pb-6 pt-5 text-white shadow-xl shadow-pink-200">
          <p className="text-sm text-white/85">Nhật ký hoạt động</p>
          <h1 className="text-2xl font-extrabold">Hành trình của bé</h1>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {babies.map((baby) => {
              const active = baby.id === activeBabyId;
              return (
                <button
                  key={baby.id}
                  onClick={() => setActiveBabyId(baby.id)}
                  className={`rounded-4xl p-3 text-left ${active ? "bg-white text-slate-950 shadow-lg" : "bg-white/20 text-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
                      {baby.avatar}
                    </div>
                    <div>
                      <p className="font-extrabold">{baby.name}</p>
                      <p
                        className={`text-xs ${active ? "text-slate-500" : "text-white/80"}`}
                      >
                        Nhật ký riêng
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </header>

        <section className="space-y-5 px-5 pt-5">
          <div className="rounded-[2rem] border border-pink-100 bg-white p-4 shadow-sm shadow-pink-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-pink-500">
                  Tổng số ghi nhận
                </p>
                <h2 className="text-xl font-extrabold">
                  {filteredLogs.length} hoạt động
                </h2>
              </div>
              <CalendarDays size={22} className="text-pink-500" />
            </div>
            <p className="text-sm leading-6 text-slate-500">
              Lưu lại toàn bộ ăn, ngủ, sữa, tã và các khoảnh khắc chăm sóc quan
              trọng của bé.
            </p>
          </div>

          {Object.entries(groupedLogs).length > 0 ? (
            Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <section
                key={date}
                className="rounded-[2rem] border border-pink-100 bg-white p-4 shadow-sm shadow-pink-100"
              >
                <h2 className="mb-4 text-lg font-extrabold capitalize">
                  {formatLogDate(date)}
                </h2>
                <div className="space-y-3">
                  {dateLogs.map((log) => {
                    const meta = trackingMeta[log.type];
                    return (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 rounded-2xl bg-pink-50/70 p-3"
                      >
                        <p className="w-12 text-xs font-bold text-slate-400">
                          {formatLogTime(log.loggedAt)}
                        </p>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                          {meta.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold">{log.title}</p>
                          <p className="truncate text-xs text-slate-500">
                            {log.value}
                            {log.note ? ` · ${log.note}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteTrackingLog(log.id)}
                          className="rounded-full bg-white p-2 text-rose-500 shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-[2rem] border border-pink-100 bg-white p-6 text-center shadow-sm shadow-pink-100">
              <p className="text-4xl">📝</p>
              <h2 className="mt-3 text-lg font-extrabold">Chưa có nhật ký</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Hãy thêm ghi nhận đầu tiên ở trang Theo dõi.
              </p>
            </div>
          )}
        </section>
        <BottomNav />
      </div>
    </main>
  );
}

function groupLogsByDate(logs: TrackingLog[]) {
  return logs.reduce<Record<string, TrackingLog[]>>((groups, log) => {
    const key = new Date(log.loggedAt).toISOString().slice(0, 10);
    groups[key] = groups[key] ?? [];
    groups[key].push(log);
    return groups;
  }, {});
}
