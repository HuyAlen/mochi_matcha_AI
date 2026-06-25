"use client";

import { useSyncExternalStore, useState } from "react";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";

type PermissionState = "unsupported" | "default" | "granted" | "denied";

function getNotificationPermission(): PermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission as PermissionState;
}

function subscribePermissionChange(callback: () => void) {
  if (typeof navigator === "undefined") return () => {};

  const permissionApi = navigator.permissions;

  if (!permissionApi?.query) return () => {};

  let permissionStatus: PermissionStatus | null = null;
  let cancelled = false;

  permissionApi
    .query({ name: "notifications" as PermissionName })
    .then((status) => {
      if (cancelled) return;

      permissionStatus = status;
      status.addEventListener("change", callback);
    })
    .catch(() => {});

  return () => {
    cancelled = true;
    permissionStatus?.removeEventListener("change", callback);
  };
}

export default function NotificationPermissionCard() {
  const [isRegistering, setIsRegistering] = useState(false);

  const permission = useSyncExternalStore(
    subscribePermissionChange,
    getNotificationPermission,
    () => "default",
  );

  async function enableNotification() {
    if (!("Notification" in window)) return;

    setIsRegistering(true);

    try {
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
      }

      await Notification.requestPermission();
    } finally {
      setIsRegistering(false);
    }
  }

  if (permission === "unsupported") {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <BellOff className="h-5 w-5 text-slate-400" />
          <div>
            <p className="font-semibold text-slate-900">
              Thiết bị chưa hỗ trợ thông báo
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Hãy dùng Chrome/Edge Android hoặc cài PWA ra màn hình chính.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === "granted") {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-900">Đã bật thông báo</p>
            <p className="mt-1 text-sm text-emerald-700">
              Khi lưu hẹn nhắc, app sẽ gửi thông báo khi đến giờ.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-violet-50 p-2">
          <Bell className="h-5 w-5 text-violet-600" />
        </div>

        <div className="flex-1">
          <p className="font-semibold text-slate-900">
            Bật nhắc cữ ngoài màn hình
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Cho phép thông báo để nhận nhắc bú, ngủ, thay tã và ăn dặm.
          </p>

          <button
            type="button"
            onClick={enableNotification}
            disabled={isRegistering || permission === "denied"}
            className="mt-3 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {permission === "denied"
              ? "Đã bị chặn trong trình duyệt"
              : isRegistering
                ? "Đang bật..."
                : "Bật thông báo"}
          </button>
        </div>
      </div>
    </div>
  );
}
