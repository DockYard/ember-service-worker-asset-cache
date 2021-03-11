import {
  FILES,
  PREPEND,
  VERSION,
  REQUEST_MODE,
  LENIENT_ERRORS
} from 'ember-service-worker-asset-cache/service-worker/config';
import cleanupCaches from 'ember-service-worker/service-worker/cleanup-caches';

const CACHE_KEY_PREFIX = 'esw-asset-cache';
const CACHE_NAME = `${CACHE_KEY_PREFIX}-${VERSION}`;

// Determine the base url for cache files by testing if the prepend starts with a protocol
const protocolRegex = /^(?:[a-z0-9]*:)?\/\//i;
const prependOption = PREPEND  || '';
const prependIsAbsolute = protocolRegex.test(prependOption);
const CACHE_BASE_URL = prependIsAbsolute ? prependOption : self.location;
const CACHE_FILE_PREPEND = prependIsAbsolute || prependOption === '/' ? '' : prependOption;

const CACHE_URLS = FILES.map((file) => {
  return new URL(CACHE_FILE_PREPEND + file, CACHE_BASE_URL).toString();
});

/*
 * Removes all cached requests from the cache that aren't in the `CACHE_URLS`
 * list.
 */
const PRUNE_CURRENT_CACHE = () => {
  caches.open(CACHE_NAME).then((cache) => {
    return cache.keys().then((keys) => {
      keys.forEach((request) => {
        if (CACHE_URLS.indexOf(request.url) === -1) {
          cache.delete(request);
        }
      });
    });
  });
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return Promise.all(CACHE_URLS.map((url) => {
          let request = new Request(url, { mode: REQUEST_MODE });
          return fetch(request)
            .then((response) => {
              if (response.status >= 400) {
                let error = new Error(`Request for ${url} failed with status ${response.statusText}`);

                if (LENIENT_ERRORS) {
                  console.warn(`Not caching ${url} due to ${error}`);
                  return;
                } else {
                  throw error;
                }
              }

              return cache.put(url, response);
            })
            .catch(function(error) {
              console.error(`Not caching ${url} due to ${error}`);
            });
        }));
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      cleanupCaches(CACHE_KEY_PREFIX, CACHE_NAME),
      PRUNE_CURRENT_CACHE()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  let isGETRequest = event.request.method === 'GET';
  let shouldRespond = CACHE_URLS.indexOf(event.request.url) !== -1;

  if (isGETRequest && shouldRespond) {
    event.respondWith(
      caches.match(event.request, { cacheName: CACHE_NAME })
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request.url, { mode: REQUEST_MODE }).then(
            function(response) {
              if(!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              var responseToCache = response.clone();  
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
              return response;
            }
          );
        })
    );
  }
});
