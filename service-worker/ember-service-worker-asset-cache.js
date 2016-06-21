var CACHE_NAME = `asset-cache-${VERSION}`;

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        cache.add('/');
        return fetch('assets/assetMap.json').then(function(response) {
          return response.json();
        }).then(function(json) {
          return Object.keys(json.assets).map(function(key) {
            return json.assets[key];
          });
        }).then(function(files) {
          return cache.addAll(files);
        });
      })
  );
});

self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = new URL(event.request.url);

  if(url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request, { cacheName: CACHE_NAME })
      .then(function(response) {
        if (response) {
          return response;
        }

        return fetch(event.request);
      }
    )
  );
});
