const CACHE_NAME = 'matrix-cache-v11';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './core.js',
  './manifest.json',
  './icon.svg',
  './adapters/_sorting.js',
  './adapters/_filter.js',
  './adapters/_normalize.js',
  './adapters/_pipeline.js',
  './adapters/_registry.js',
  './adapters/openrouter/index.js',
  './adapters/groq/index.js',
  './adapters/gemini/index.js',
  './adapters/sambanova/index.js',
  './adapters/mistral/index.js',
  './adapters/cohere/index.js',
  './adapters/llm7/index.js',
  './adapters/modelscope/index.js',
  './adapters/nvidia/index.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Route 1: API / External Calls -> Network-Only
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Route 2: HTML / Navigation Requests -> Network-First (ensures fresh HTML on reload)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then(res => {
          return res || caches.match('./index.html') || caches.match('./');
        });
      })
    );
    return;
  }

  // Route 3: JavaScript Files (e.g. core.js) -> Network-First
  if (url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Route 4: Local JSON Data -> Network-First
  if (url.pathname.endsWith('.json') && !url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Route 5: Static Assets (icons, manifest) -> Cache-First
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        if (fetchResponse.status === 200) {
          const clone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return fetchResponse;
      });
    })
  );
});
