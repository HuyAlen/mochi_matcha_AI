"use client";

import { useState } from "react";
import {
  getNotificationPermission,
  registerNotificationWorker,
  requestNotificationPermission,
  showTestNotification,
  type NotificationPermissionStatus,
} from "@/src/services/notifications/localNotifications";

export default function NotificationPermissionCard() {
  const [permission, setPermission] = useState<NotificationPermissionStatus>(
    () => getNotificationPermission(),
  );

  async function enableNotifications() {
    await registerNotificationWorker();

    const nextPermission = await requestNotificationPermission();
    setPermission(nextPermission);

    if (nextPermission === "granted") {
      await showTestNotification(
        "Mind AI",
        "Đã bật thông báo nhắc nhở cho Mochi & Matcha.",
      );
    }
  }

  if (permission === "granted") {
    return (
      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-emerald-100">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
            🔔
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">
              Notifications on
            </p>
            <h3 className="mt-1 font-black text-slate-950">
              Thông báo đã được bật
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Khi lưu nhắc nhở, Mind AI có thể gửi thông báo kiểm tra trên thiết
              bị.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === "unsupported") {
    return (
      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-amber-100">
        <p className="font-black text-slate-950">
          Trình duyệt chưa hỗ trợ thông báo.
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Hãy thử Chrome Android, Edge hoặc cài app dạng PWA để bật
          notification.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-pink-100">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
          🔔
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
            Local notifications
          </p>
          <h3 className="mt-1 font-black text-slate-950">
            Bật thông báo nhắc nhở
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Cho phép Mind AI gửi thông báo nhắc uống sữa, ngủ, thay tã và ăn
            dặm.
          </p>

          <button
            type="button"
            onClick={enableNotifications}
            className="mt-4 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-black text-white shadow-sm active:scale-[0.99]"
          >
            Bật thông báo
          </button>
        </div>
      </div>
    </div>
  );
}
