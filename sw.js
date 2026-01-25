const CACHE='budget-cache-v1';
const ASSETS=['./','./index.html','./style.css','https://cdn.jsdelivr.net/npm/chart.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
