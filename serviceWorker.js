/**
 * Production Service Worker for LWC OSS App
 * Features:
 * - Precache assets using Workbox injectManifest
 * - Runtime caching for styles, scripts, images, fonts
 * - Network-first for HTML navigation and API calls
 * - Offline fallback for HTML
 * - Background sync + push notifications
 */

importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js'
);

// Enable Workbox only if loaded correctly
if (typeof workbox !== 'undefined') {
    console.log('[SW] Workbox loaded');

    // Injected by Workbox CLI based on workbox-config.js
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

    // Runtime cache: static assets (style, script, image, font)
    workbox.routing.registerRoute(
        ({ request }) =>
            ['style', 'script', 'image', 'font'].includes(request.destination),
        new workbox.strategies.CacheFirst({
            cacheName: 'lwc-oss-static-v1',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                })
            ]
        })
    );

    // Runtime cache: HTML (navigation requests)
    workbox.routing.registerRoute(
        ({ request }) =>
            request.mode === 'navigate' || request.destination === 'document',
        new workbox.strategies.NetworkFirst({
            cacheName: 'lwc-oss-pages-v1',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 50,
                    maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
                })
            ]
        })
    );

    // Runtime cache: API calls (network-first)
    workbox.routing.registerRoute(
        ({ url }) => url.pathname.startsWith('/api/'),
        new workbox.strategies.NetworkFirst({
            cacheName: 'lwc-oss-api-cache',
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

    // Catch handler for offline fallback
    workbox.routing.setCatchHandler(async ({ event }) => {
        if (event.request.destination === 'document') {
            return caches.match('/assets/offline.html');
        }
        return Response.error();
    });

    // Default handler
    workbox.routing.setDefaultHandler(
        new workbox.strategies.NetworkFirst({
            cacheName: 'lwc-oss-dynamic-v1'
        })
    );
} else {
    console.warn('[SW] Workbox failed to load.');
}

/**
 * Background Sync for pending operations (like offline form submissions)
 */
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    if (event.tag === 'sync-pending-operations') {
        event.waitUntil(
            self.clients.matchAll().then((clients) => {
                if (clients.length > 0) {
                    clients[0].postMessage({
                        type: 'SYNC_FROM_SERVICE_WORKER'
                    });
                }
                return Promise.resolve();
            })
        );
    }
});

/**
 * Push Notification Support
 */
self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event);

    let data = {
        title: 'Notification',
        body: 'You have a new message.'
    };

    if (event.data) {
        try {
            data = JSON.parse(event.data.text());
        } catch (e) {
            console.error('[SW] Failed to parse push payload:', e);
        }
    }

    const options = {
        body: data.body,
        icon: '/assets/images/android-chrome-192x192.png',
        badge: '/assets/images/favicon-32x32.png'
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});
