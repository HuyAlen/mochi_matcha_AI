import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { Reminder } from "@/types/reminder";

function getNativeNotificationId(id: string) {
  return Math.abs(
    id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0),
  );
}

export async function requestNativeNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false;

  const current = await LocalNotifications.checkPermissions();

  if (current.display === "granted") return true;

  const requested = await LocalNotifications.requestPermissions();

  return requested.display === "granted";
}

export async function scheduleNativeReminder(reminder: Reminder) {
  if (!Capacitor.isNativePlatform()) return;

  const granted = await requestNativeNotificationPermission();
  if (!granted) return;

  const remindAt = new Date(reminder.remindAt);

  if (Number.isNaN(remindAt.getTime())) return;
  if (remindAt.getTime() <= Date.now()) return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: getNativeNotificationId(reminder.id),
        title: reminder.title || "Mind AI Reminder",
        body: reminder.note || "Đến giờ chăm bé rồi.",
        schedule: {
          at: remindAt,
          allowWhileIdle: true,
        },
        extra: {
          reminderId: reminder.id,
          babyId: reminder.babyId,
          type: reminder.type,
        },
      },
    ],
  });
}

export async function cancelNativeReminder(reminderId: string) {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.cancel({
    notifications: [
      {
        id: getNativeNotificationId(reminderId),
      },
    ],
  });
}
