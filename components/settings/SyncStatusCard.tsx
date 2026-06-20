"use client";

import { RefreshCw } from "lucide-react";

import { useSyncStore } from "@/store/syncStore";

export default function SyncStatusCard() {
  const syncing = useSyncStore((state) => state.syncing);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);
  const error = useSyncStore((state) => state.error);
  const syncNow = useSyncStore((state) => state.syncNow);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-pink-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-900">Đồng bộ dữ liệu</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Sao lưu hồ sơ bé, nhật ký theo dõi và lịch tiêm lên Supabase.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
          Cloud
        </span>
      </div>

      <button
        type="button"
        onClick={() => void syncNow()}
        disabled={syncing}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-500 px-4 py-3 text-sm font-black text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
      </button>

      {lastSyncedAt ? (
        <p className="mt-3 text-xs font-semibold text-slate-500">
          Lần cuối: {new Date(lastSyncedAt).toLocaleString("vi-VN")}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
