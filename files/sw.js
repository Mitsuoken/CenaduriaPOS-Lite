/* ============================================================
   Service Worker - CenaduriaPOS Lite
   Guarda en caché los archivos necesarios para funcionar sin internet
   ============================================================ */

const CACHE_NOMBRE = "cenaduria-pos-v1";

const ARCHIVOS_CACHE = [
  "./index.html",
  "./mesa.html",
  "./historial.html",
  "./estilos.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

// Al instalar: guarda todos los archivos en caché
self.addEventListener("install", (evento) => {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(CACHE_NOMBRE).then((cache) => {
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
});

// Al activar: borra cachés viejos de versiones anteriores
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) => {
      return Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NOMBRE)
          .map((nombre) => caches.delete(nombre))
      );
    })
  );
  self.clients.claim();
});

// Al pedir un archivo: primero busca en caché, si no existe va a la red
self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((respuestaCache) => {
      if (respuestaCache) return respuestaCache;

      return fetch(evento.request)
        .then((respuestaRed) => {
          // Guarda copia en caché para la próxima vez (solo peticiones GET)
          if (evento.request.method === "GET") {
            const copia = respuestaRed.clone();
            caches.open(CACHE_NOMBRE).then((cache) => {
              cache.put(evento.request, copia);
            });
          }
          return respuestaRed;
        })
        .catch(() => {
          // Sin internet y sin caché: si pide una página, muestra index.html
          if (evento.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
