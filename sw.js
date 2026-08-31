const CACHE_NAME = "daybook-v2";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
 
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});
 
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
// Never cache live API calls to Google — only the static app shell.
// Network-first: always try to fetch the latest version. Only fall back
// to the cached copy if the network request fails (e.g. you're offline).
// This means edits to index.html show up immediately next time you're
// online, instead of getting stuck on an old cached copy.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.includes("googleapis.com") || url.includes("accounts.google.com")) {
    return; // let these go straight to the network
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
 
