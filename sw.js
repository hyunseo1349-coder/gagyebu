self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('gagyebu-v1').then(cache =>
      cache.addAll(['./','./index.html','./style.css'])
    )
  );
});
