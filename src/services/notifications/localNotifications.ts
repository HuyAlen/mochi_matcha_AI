export type NotificationPermissionStatus =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

export interface ReminderNotificationPayload {
  id: string;
  title: string;
  time: string;
  repeatLabel?: string;
  enabled?: boolean;
}

export function getNotificationPermission(): NotificationPermissionStatus {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";

  return Notification.permission;
}

export async function registerNotificationWorker() {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;

  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error("Failed to register notification worker:", error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return Notification.permission;
  }
}

export async function showTestNotification(title: string, body: string) {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  try {
    const registration =
      (await navigator.serviceWorker.ready) ??
      (await registerNotificationWorker());

    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "mind-ai-reminder",
      });

      return true;
    }

    new Notification(title, {
      body,
      icon: "/icons/icon-192.png",
      tag: "mind-ai-reminder",
    });

    return true;
  } catch (error) {
    console.error("Failed to show notification:", error);
    return false;
  }
}

export async function showReminderSavedNotification(
  reminder: ReminderNotificationPayload,
) {
  return showTestNotification(
    "Mind AI Reminder",
    `Đã lưu nhắc nhở: ${reminder.title} lúc ${reminder.time}${
      reminder.repeatLabel ? ` · ${reminder.repeatLabel}` : ""
    }`,
  );
}

export async function syncReminderNotifications(
  reminders: ReminderNotificationPayload[],
) {
  if (!Array.isArray(reminders)) return false;

  const activeReminders = reminders.filter(
    (reminder) => reminder.enabled !== false,
  );

  if (activeReminders.length === 0) return false;

  return showTestNotification(
    "Mind AI Reminder",
    `Đã đồng bộ ${activeReminders.length} nhắc nhở chăm bé.`,
  );
}
