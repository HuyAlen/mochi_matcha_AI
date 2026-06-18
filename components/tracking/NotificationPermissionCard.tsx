"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getNotificationPermission,
  registerNotificationWorker,
  requestNotificationPermission,
  showTestNotification,
  type NotificationPermissionStatus,
} from "@/src/services/notifications/localNotifications";

function subscribePermissionStore() {
  return () => {};
}

function getPermissionSnapshot(): NotificationPermissionStatus {
  return getNotificationPermission();
}

function getServerPermissionSnapshot(): NotificationPermissionStatus {
  return "default";
}

export default function NotificationPermissionCard() {
  const browserPermission = useSyncExternalStore(
    subscribePermissionStore,
    getPermissionSnapshot,
    getServerPermissionSnapshot,
  );

  const [permissionOverride, setPermissionOverride] =
    useState<NotificationPermissionStatus | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const permission = permissionOverride ?? browserPermission;

  useEffect(() => {
    void registerNotificationWorker();
  }, []);

  async function enableNotifications() {
    setIsRequesting(true);
    try {
      const nextPermission = await requestNotificationPermission();
      setPermissionOverride(nextPermission);

      if (nextPermission === "granted") {
        await showTestNotification(
          "Mind AI",
          "Thông báo hoạt động bình thường.",
        );
      }
    } finally {
      setIsRequesting(false);
    }
  }

  return null;
}
