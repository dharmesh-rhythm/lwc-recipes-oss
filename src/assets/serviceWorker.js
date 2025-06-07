/**
 * Service Worker for LWC OSS Mobile Application
 * Handles caching and offline capability
 */

// Service worker version - increment this when service worker logic changes
const CACHE_VERSION = 'v1';

// Cache names
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
    '/lwc.js'
];

// Install event handler - cache static assets
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

// Activate event handler - clean up old caches
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
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Claiming clients');
                return self.clients.claim(); // Take control of all clients
            })
    );
});

// Fetch event handler - serve from cache or network
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

                    // Cache the fetched resource
                    caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                })
                .catch((err) => {
                    console.error('[Service Worker] Fetch failed:', err);
                    // If it's an HTML request, return the offline page
                    if (
                        event.request.headers
                            .get('accept')
                            .includes('text/html')
                    ) {
                        return caches.match('/offline.html');
                    }
                });
        })
    );
});

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
                        type: 'SYNC_PENDING_OPERATIONS'
                    });
                }
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
        icon: '/assets/images/logo.svg',
        badge: '/assets/images/favicon-32x32.png'
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});
