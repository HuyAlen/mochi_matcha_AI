import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export type ReminderNotificationInput = {
  id: string;
  title: string;
  body?: string;
  remindAt: string;
  url?: string;
};

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function getNotificationBody(input: ReminderNotificationInput) {
  return input.body?.trim() || "Đến giờ chăm sóc bé.";
}

function getNotificationUrl(input: ReminderNotificationInput) {
  return input.url || "/dashboard";
}

function getNumericNotificationId(id: string) {
  let hash = 0;

  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }

  return Math.max(1, hash % 2147483647);
}

function isValidFutureDate(value: string) {
  const remindTime = new Date(value).getTime();

  if (!Number.isFinite(remindTime)) {
    return false;
  }

  return remindTime > Date.now();
}

async function ensureNativeNotificationPermission() {
  const permissionStatus = await LocalNotifications.checkPermissions();

  if (permissionStatus.display === "granted") {
    return true;
  }

  const requestedStatus = await LocalNotifications.requestPermissions();
  return requestedStatus.display === "granted";
}

async function scheduleNativeReminderNotification(
  input: ReminderNotificationInput,
) {
  const hasPermission = await ensureNativeNotificationPermission();

  if (!hasPermission) {
    return;
  }

  const notificationId = getNumericNotificationId(input.id);

  await LocalNotifications.cancel({
    notifications: [{ id: notificationId }],
  });

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notificationId,
        title: input.title,
        body: getNotificationBody(input),
        schedule: {
          at: new Date(input.remindAt),
          allowWhileIdle: true,
        },
        extra: {
          reminderId: input.id,
          url: getNotificationUrl(input),
        },
      },
    ],
  });
}

async function scheduleWebReminderNotification(
  input: ReminderNotificationInput,
) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (!("serviceWorker" in navigator)) return;
  if (Notification.permission !== "granted") return;

  const remindTime = new Date(input.remindAt).getTime();
  const delay = remindTime - Date.now();

  if (!Number.isFinite(remindTime) || delay <= 0) return;

  if (timers.has(input.id)) {
    clearTimeout(timers.get(input.id));
  }

  const timer = setTimeout(async () => {
    const registration = await navigator.serviceWorker.ready;

    if (registration.active) {
      registration.active.postMessage({
        type: "SHOW_REMINDER_NOTIFICATION",
        title: input.title,
        body: getNotificationBody(input),
        tag: `mind-ai-reminder-${input.id}`,
        url: getNotificationUrl(input),
      });
    } else {
      await registration.showNotification(input.title, {
        body: getNotificationBody(input),
        icon: "/icons/icon-192.svg",
        badge: "/icons/icon-192.svg",
        tag: `mind-ai-reminder-${input.id}`,
        data: { url: getNotificationUrl(input) },
      });
    }

    timers.delete(input.id);
  }, delay);

  timers.set(input.id, timer);
}

export async function scheduleReminderNotification(
  input: ReminderNotificationInput,
) {
  if (!isValidFutureDate(input.remindAt)) {
    return;
  }

  if (Capacitor.isNativePlatform()) {
    await scheduleNativeReminderNotification(input);
    return;
  }

  await scheduleWebReminderNotification(input);
}

export async function cancelReminderNotification(id: string) {
  const timer = timers.get(id);

  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }

  if (!Capacitor.isNativePlatform()) {
    return;
  }

  await LocalNotifications.cancel({
    notifications: [{ id: getNumericNotificationId(id) }],
  });
}
