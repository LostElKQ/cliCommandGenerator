import { self } from "$app/service-worker";
import { version } from "$app/env";
import { assets, immutable } from "$app/manifest";
import { asset, resolve } from "$app/paths";

const CACHE = `cache-${version}`;

const ASSETS: string[] = [
  ...immutable.map(({ path }) => resolve(path as "")),
  ...assets.map(({ path }) => asset(path)),
];

async function addFilesToCache(): Promise<void> {
  const cache = await caches.open(CACHE);
  await cache.addAll(ASSETS);
}

async function deleteOldCaches(): Promise<void> {
  const keys = await caches.keys();
  for (const key of keys) {
    if (key !== CACHE) {
      await caches.delete(key);
    }
  }
}

async function respond(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const cache = await caches.open(CACHE);

  if (ASSETS.includes(url.pathname)) {
    const response = await cache.match(url.pathname);
    if (response) {
      return response;
    }
  }

  try {
    const response = await fetch(request);
    if (response.status === 200 && !response.headers.get("cache-control")?.includes("no-store")) {
      void cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const response = await cache.match(request);
    if (response) {
      return response;
    }
    throw error;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(addFilesToCache());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(respond(event.request));
});
