self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  // Forzar activación inmediata
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  // Tomar control de todas las páginas inmediatamente
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log("[SW] Claimed all clients");
      // Forzar recarga de todas las páginas
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          console.log("[SW] Reloading client:", client.url);
          client.navigate(client.url);
        });
      });
    })
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Solo interceptar peticiones del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  console.log("[SW] Intercepting:", url.pathname);

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
        newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");

        console.log("[SW] Adding headers to:", url.pathname);

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      })
      .catch((err) => {
        console.error("[SW] Fetch error:", err);
        return fetch(event.request);
      })
  );
});
