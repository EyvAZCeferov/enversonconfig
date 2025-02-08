self.addEventListener ('install', e => {
  e.waitUntil (
    caches.open ('static').then (cache => {
      const resources = [
        '/favicon.ico',
        '/icon.png',
        '/javascript/chat.js',
        '/javascript/peer.js',
        '/javascript/stream.js',
        '/javascript/viewer.js',
        '/font/v.eot',
        '/font/v.svg',
        '/font/v.ttf',
        '/font/v.woff',
        '/font/v.woff2',
        '/stylesheets/fonts.css',
      ];

      return Promise.all (
        resources.map (resource =>
          fetch (resource)
            .then (response => {
              if (response.ok) {
                return cache.put (resource, response);
              } else {
                console.warn (`Failed to cache ${resource}:`, response.status);
              }
            })
            .catch (err => {
              console.error (`Error fetching ${resource}:`, err);
            })
        )
      );
    })
  );
});

self.addEventListener ('fetch', e => {
  e.respondWith (
    caches.match (e.request).then (response => response || fetch (e.request))
  );
});
