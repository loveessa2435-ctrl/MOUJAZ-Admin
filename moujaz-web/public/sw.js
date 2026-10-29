// MOUJAZ PWA: no caching of authenticated pages, APIs, or private files.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => { /* network-only to protect student data */ });
