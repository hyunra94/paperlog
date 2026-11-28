const CACHE_NAME = "paper-log-v131";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  // 같은 tag 알림이 알림창에 남아 있으면 소리·팝업 없이 조용히 바뀌므로 renotify로 다시 울리게 한다.
  // 열려 있는 앱 화면에 '도착/표시 결과'를 알려 줘서 테스트 때 어디서 막히는지 확인할 수 있게 한다.
  const report = msg => self.clients.matchAll({ type: "window", includeUncontrolled: true })
    .then(list => list.forEach(c => c.postMessage({ type: "paperlog-push", ...msg })))
    .catch(() => {});

  event.waitUntil(
    self.registration.showNotification(data.title || "Paper Log", {
      body: data.body || "",
      tag: data.tag || undefined,
      renotify: Boolean(data.tag),
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-192.png",
      data: { url: data.url || "./" }
    })
      .then(() => report({ shown: true, tag: data.tag || "" }))
      .catch(err => report({ shown: false, tag: data.tag || "", error: String(err && err.message || err) }))
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "./", self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      if (!target.startsWith(self.registration.scope)) return self.clients.openWindow(target);
      const existing = list.find(c => c.url.startsWith(self.registration.scope));
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  if (url.pathname.includes("/api/")) {
    return;
  }

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
