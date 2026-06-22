export type ReminderNotificationInput = {
  id: string;
  title: string;
  body?: string;
  remindAt: string;
  url?: string;
};

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export async function scheduleReminderNotification(
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
    const reg = await navigator.serviceWorker.ready;

    if (reg.active) {
      reg.active.postMessage({
        type: "SHOW_REMINDER_NOTIFICATION",
        title: input.title,
        body: input.body || "Đến giờ chăm sóc bé.",
        tag: `mind-ai-reminder-${input.id}`,
        url: input.url || "/dashboard",
      });
    } else {
      await reg.showNotification(input.title, {
        body: input.body || "Đến giờ chăm sóc bé.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: `mind-ai-reminder-${input.id}`,
        data: { url: input.url || "/dashboard" },
      });
    }

    timers.delete(input.id);
  }, delay);

  timers.set(input.id, timer);
}

export function cancelReminderNotification(id: string) {
  const timer = timers.get(id);
  if (!timer) return;

  clearTimeout(timer);
  timers.delete(id);
}
