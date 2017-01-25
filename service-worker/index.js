import {
  files,
  prepend,
  version
} from 'ember-service-worker-asset-cache/service-worker/config';

const CACHE_KEY_PREFIX = 'esw-asset-cache';
const CACHE_NAME = `${CACHE_KEY_PREFIX}-${version}`;
const CACHE_URLS = files.map((file) => {
  return new URL(file, (prepend || self.location)).toString();
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return Promise.all(CACHE_URLS.map((url) => {
          return cache.add(new Request(url, {
            credentials: 'include'
          }));
        }));
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          if (cacheName.indexOf(CACHE_KEY_PREFIX) === 0 && cacheName !== CACHE_NAME) {
            caches.delete(cacheName);
          }
        });
      }),
      caches.open(CACHE_NAME).then((cache) => {
        return cache.keys().then((keys) => {
          keys.forEach((request) => {
            if (CACHE_URLS.indexOf(request.url) === -1) {
              cache.delete(request);
            }
          });
        });
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && CACHE_URLS.indexOf(event.request.url) !== -1) {
    event.respondWith(
      caches
        .match(event.request, { cacheName: CACHE_NAME })
        .then((response) => {
          if (response) {
            return response;
          }
        })
    );
  }
});
