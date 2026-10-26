const CACHE_NAME = 'chorale-v2';

// Liste des ressources essentielles à mettre en cache pour l'accès hors-ligne
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './seconde.html',
  './css/style.css',
  './img/m_mini.png',
  './img/fleche.png',
  './img/logochorale.png',
  './img/symphonique.png',
];

// Installation du Service Worker et mise en cache initiale
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache des ressources');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation du Service Worker et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Suppression du vieux cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes réseau (stratégie : Réseau d'abord, secours sur le cache si hors-ligne)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la requête réussi, on enregistre une copie fraîche dans le cache
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de coupure internet, on sert la version en cache
        return caches.match(event.request);
      })
  );
});