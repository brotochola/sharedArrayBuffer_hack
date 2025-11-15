self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(self.clients.claim());
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
        // Clonar la respuesta
        const newHeaders = new Headers(response.headers);

        // Añadir los headers necesarios
        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
        newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");

        console.log("[SW] Adding COOP/COEP headers to:", url.pathname);

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
