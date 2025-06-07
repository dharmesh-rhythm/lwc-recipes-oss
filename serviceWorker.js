/**
 * Service Worker for LWC OSS Mobile Application
 * Handles caching and offline capability using Workbox
 */

importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js'
);

// Use Workbox's debug mode in development only
// self.workbox.setConfig({ debug: true });

// Service worker version - increment this when service worker logic changes
const CACHE_VERSION = 'v3';
const STATIC_CACHE_NAME = `lwc-oss-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `lwc-oss-dynamic-${CACHE_VERSION}`;

// Assets to cache immediately when service worker is installed
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/assets/css/main.css',
    '/assets/css/normalize.css',
    '/assets/icons/standard-sprite/svg/symbols.svg',
    '/assets/icons/utility-sprite/svg/symbols.svg',
    '/lwc.js',
    '/assets/offline.html',
    '/assets/images/android-chrome-192x192.png',
    '/assets/images/android-chrome-512x512.png',
    '/assets/images/apple-touch-icon.png',
    '/assets/site.webmanifest'
];

// Wait for the workbox to be ready
if (typeof workbox !== 'undefined') {
    console.log(`Workbox is loaded`);

    // Set up workbox precaching
    workbox.precaching.precacheAndRoute(
        STATIC_ASSETS.map((url) => ({
            url,
            revision: CACHE_VERSION
        }))
    );

    // Use cache-first strategy for static assets
    workbox.routing.registerRoute(
        ({ request }) =>
            request.destination === 'style' ||
            request.destination === 'script' ||
            request.destination === 'image' ||
            request.destination === 'font',
        new workbox.strategies.CacheFirst({
            cacheName: STATIC_CACHE_NAME,
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                })
            ]
        })
    );

    // Use network-first for HTML documents
    workbox.routing.registerRoute(
        ({ request }) =>
            request.mode === 'navigate' || request.destination === 'document',
        new workbox.strategies.NetworkFirst({
            cacheName: DYNAMIC_CACHE_NAME,
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 50,
                    maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
                })
            ]
        })
    );

    // API requests - network first
    workbox.routing.registerRoute(
        ({ url }) => url.pathname.includes('/api/'),
        new workbox.strategies.NetworkFirst({
            cacheName: 'api-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 100,
                    maxAgeSeconds: 24 * 60 * 60 // 1 day
                }),
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200]
                })
            ]
        })
    );

    // Default fallback for other requests - network with cache fallback
    workbox.routing.setDefaultHandler(
        new workbox.strategies.NetworkFirst({
            cacheName: DYNAMIC_CACHE_NAME
        })
    );

    // Fallback for navigation requests
    workbox.routing.setCatchHandler(({ event }) => {
        if (event.request.destination === 'document') {
            return caches.match('/assets/offline.html');
        }
        return Response.error();
    });
} else {
    console.log(
        `Workbox didn't load, falling back to traditional service worker`
    );

    // Install event handler - cache static assets (fallback)
    self.addEventListener('install', (event) => {
        console.log('[Service Worker] Installing Service Worker...', event);

        event.waitUntil(
            caches
                .open(STATIC_CACHE_NAME)
                .then((cache) => {
                    console.log('[Service Worker] Precaching App Shell');
                    return cache.addAll(STATIC_ASSETS);
                })
                .then(() => {
                    console.log('[Service Worker] Precaching completed');
                    return self.skipWaiting(); // Ensure the new service worker activates immediately
                })
        );
    });

    // Activate event handler - clean up old caches (fallback)
    self.addEventListener('activate', (event) => {
        console.log('[Service Worker] Activating Service Worker...', event);

        event.waitUntil(
            caches
                .keys()
                .then((keyList) => {
                    return Promise.all(
                        keyList.map((key) => {
                            if (
                                key !== STATIC_CACHE_NAME &&
                                key !== DYNAMIC_CACHE_NAME
                            ) {
                                console.log(
                                    '[Service Worker] Removing old cache',
                                    key
                                );
                                return caches.delete(key);
                            }
                            return Promise.resolve();
                        })
                    );
                })
                .then(() => {
                    console.log('[Service Worker] Claiming clients');
                    return self.clients.claim(); // Take control of all clients
                })
        );
    });

    // Fetch event handler - serve from cache or network (fallback)
    self.addEventListener('fetch', (event) => {
        // Skip non-GET requests
        if (event.request.method !== 'GET') return;

        // Skip browser-extension requests and non-http(s) requests
        if (!event.request.url.startsWith('http')) return;

        // Handle API requests differently
        if (event.request.url.includes('/api/')) {
            handleApiRequest(event);
            return;
        }

        // For static assets, use cache-first strategy
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    // Found in cache
                    return response;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Clone the response as it can only be consumed once
                        const responseToCache = networkResponse.clone();

                        // Cache the fetched resource if it's a valid response
                        if (networkResponse.status === 200) {
                            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        }

                        return networkResponse;
                    })
                    .catch((err) => {
                        console.error('[Service Worker] Fetch failed:', err);
                        // If it's an HTML request, return the offline page
                        if (
                            event.request.headers.get('accept') &&
                            event.request.headers
                                .get('accept')
                                .includes('text/html')
                        ) {
                            return caches.match('/assets/offline.html');
                        }
                        return Promise.reject(err);
                    });
            })
        );
    });
}

// Handle API requests with network-first strategy
function handleApiRequest(event) {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                return response;
            })
            .catch((err) => {
                console.log(
                    '[Service Worker] API fetch failed, serving from cache',
                    err
                );
                return caches.match(event.request);
            })
    );
}

// Background sync for pending operations
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background Sync', event);

    if (event.tag === 'sync-pending-operations') {
        event.waitUntil(
            // Send message to clients to perform sync
            self.clients.matchAll().then((clients) => {
                if (clients && clients.length) {
                    // Send to the first active client
                    clients[0].postMessage({
                        type: 'SYNC_FROM_SERVICE_WORKER'
                    });
                }
                return Promise.resolve();
            })
        );
    }
});

// Push notification handler
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Notification received', event);

    let data = { title: 'New Notification', body: 'Something new happened!' };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    const options = {
        body: data.body,
        icon: '/assets/images/android-chrome-192x192.png',
        badge: '/assets/images/favicon-32x32.png'
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});
