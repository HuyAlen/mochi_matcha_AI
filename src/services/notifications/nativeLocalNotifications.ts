import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { Reminder } from "@/types/reminder";

const MIN_SCHEDULE_DELAY_MS = 60_000;
const TEST_NOTIFICATION_ID = 909_120;

function logInfo(message: string, payload?: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.info(message, payload ?? "");
  }
}

function logError(message: string, error?: unknown) {
  console.error(message, error ?? "");
}

function getNativeNotificationId(id: string) {
  const hash = id.split("").reduce((value, char) => {
    return (value * 31 + char.charCodeAt(0)) >>> 0;
  }, 7);

  return Math.max(1, hash % 2_147_483_647);
}

function getSafeScheduleDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const minDate = new Date(Date.now() + MIN_SCHEDULE_DELAY_MS);

  if (date.getTime() < minDate.getTime()) {
    return minDate;
  }

  return date;
}

export async function requestNativeNotificationPermission() {
  if (!Capacitor.isNativePlatform()) {
    logInfo("[MindAI NativeNotification] Not native platform, skip permission");
    return false;
  }

  const current = await LocalNotifications.checkPermissions();
  logInfo("[MindAI NativeNotification] Current permission", current);

  if (current.display === "granted") return true;

  const requested = await LocalNotifications.requestPermissions();
  logInfo("[MindAI NativeNotification] Requested permission", requested);

  return requested.display === "granted";
}

export async function getPendingNativeNotifications() {
  if (!Capacitor.isNativePlatform()) return [];

  try {
    const pending = await LocalNotifications.getPending();
    logInfo(
      "[MindAI NativeNotification] Pending notifications",
      pending.notifications,
    );
    return pending.notifications;
  } catch (error) {
    logError(
      "[MindAI NativeNotification] Failed to get pending notifications",
      error,
    );
    return [];
  }
}

export async function scheduleNativeReminder(reminder: Reminder) {
  if (!Capacitor.isNativePlatform()) {
    logInfo(
      "[MindAI NativeNotification] Not native platform, skip reminder",
      reminder,
    );
    return false;
  }

  try {
    const granted = await requestNativeNotificationPermission();

    if (!granted) {
      logError("[MindAI NativeNotification] Permission not granted");
      return false;
    }

    const scheduleAt = getSafeScheduleDate(reminder.remindAt);

    if (!scheduleAt) {
      logError(
        "[MindAI NativeNotification] Invalid reminder time",
        reminder.remindAt,
      );
      return false;
    }

    const notificationId = getNativeNotificationId(reminder.id);

    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }],
    });

    const result = await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: reminder.title || "Mind AI Reminder",
          body: reminder.note || "Đến giờ chăm bé rồi.",
          schedule: {
            at: scheduleAt,
            allowWhileIdle: true,
          },
          extra: {
            url: "/reminders",
            reminderId: reminder.id,
            babyId: reminder.babyId,
            type: reminder.type,
          },
        },
      ],
    });

    logInfo("[MindAI NativeNotification] Reminder scheduled", {
      result,
      reminderId: reminder.id,
      notificationId,
      scheduleAt: scheduleAt.toISOString(),
      nativePlatform: Capacitor.getPlatform(),
    });

    await getPendingNativeNotifications();

    return true;
  } catch (error) {
    logError("[MindAI NativeNotification] Schedule reminder failed", error);
    return false;
  }
}

export async function scheduleTestNativeNotification(delaySeconds = 5) {
  if (!Capacitor.isNativePlatform()) {
    logError(
      "[MindAI NativeNotification] Test skipped because app is not native",
    );
    return false;
  }

  try {
    const granted = await requestNativeNotificationPermission();

    if (!granted) {
      logError(
        "[MindAI NativeNotification] Test failed because permission is not granted",
      );
      return false;
    }

    const scheduleAt = new Date(Date.now() + Math.max(1, delaySeconds) * 1000);

    await LocalNotifications.cancel({
      notifications: [{ id: TEST_NOTIFICATION_ID }],
    });

    const result = await LocalNotifications.schedule({
      notifications: [
        {
          id: TEST_NOTIFICATION_ID,
          title: "Mind AI Test",
          body: "Nếu bạn thấy thông báo này thì Native Notification hoạt động.",
          schedule: {
            at: scheduleAt,
            allowWhileIdle: true,
          },
          extra: {
            url: "/reminders",
            test: true,
          },
        },
      ],
    });

    logInfo("[MindAI NativeNotification] Test notification scheduled", {
      result,
      scheduleAt: scheduleAt.toISOString(),
      nativePlatform: Capacitor.getPlatform(),
    });

    await getPendingNativeNotifications();

    return true;
  } catch (error) {
    logError("[MindAI NativeNotification] Test notification failed", error);
    return false;
  }
}

export async function cancelNativeReminder(reminderId: string) {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const notificationId = getNativeNotificationId(reminderId);

    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }],
    });

    logInfo("[MindAI NativeNotification] Reminder cancelled", {
      reminderId,
      notificationId,
    });

    return true;
  } catch (error) {
    logError("[MindAI NativeNotification] Cancel reminder failed", error);
    return false;
  }
}
