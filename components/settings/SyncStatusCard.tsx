"use client";

import { useState } from "react";

export default function SyncStatusCard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncLabel, setLastSyncLabel] = useState("2 phút trước");

  function syncNow() {
    if (isSyncing) return;

    setIsSyncing(true);

    window.setTimeout(() => {
      setLastSyncLabel("Vừa xong");
      setIsSyncing(false);
    }, 700);
  }

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-purple-50 text-3xl text-purple-500">
          ☁️
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-400">
            Cloud Sync
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            Đồng bộ đám mây
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Dữ liệu của Mochi & Matcha được lưu an toàn và sẵn sàng khôi phục
            khi đổi thiết bị.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-400">
              Lần đồng bộ gần nhất
            </p>
            <p className="mt-1 font-black text-slate-950">{lastSyncLabel}</p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-500 ring-1 ring-emerald-100">
            Sẵn sàng
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={syncNow}
        disabled={isSyncing}
        className="mt-4 w-full rounded-2xl bg-purple-500 py-4 font-black text-white shadow-sm transition active:scale-[0.99] disabled:bg-purple-300"
      >
        {isSyncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
      </button>

      <p className="mt-3 text-center text-xs leading-5 text-slate-400">
        Cloud Sync hiện là UI foundation, sẵn sàng kết nối Supabase ở sprint
        sau.
      </p>
    </section>
  );
}
