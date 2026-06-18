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
  } catch {
    return null;
  }
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined") return "unsupported" as const;
  if (!("Notification" in window)) return "unsupported" as const;
  return Notification.requestPermission();
}

export async function showTestNotification(title: string, body: string) {
  if (getNotificationPermission() !== "granted") return false;
  new Notification(title, { body });
  return true;
}

export async function showReminderSavedNotification(
  reminder: ReminderNotificationPayload,
) {
  return showTestNotification(
    "Mind AI Reminder",
    `${reminder.title} lúc ${reminder.time}`,
  );
}
