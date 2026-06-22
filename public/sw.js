self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type !== "SHOW_REMINDER_NOTIFICATION") return;

  const title = data.title || "Đến giờ hẹn nhắc";
  const body = data.body || "Bạn có một hẹn nhắc chăm sóc bé.";
  const url = data.url || "/dashboard";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || "mind-ai-reminder",
      renotify: true,
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        const matchedClient = clientsArr.find((client) =>
          client.url.includes(targetUrl),
        );

        if (matchedClient) {
          return matchedClient.focus();
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
