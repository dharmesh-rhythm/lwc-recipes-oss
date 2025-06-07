import { LightningElement } from 'lwc';
import { syncPendingOperationsWhenOnline } from 'c/utils';

/**
 * Component to register the Service Worker for offline capability
 */
export default class ServiceWorkerRegistration extends LightningElement {
    isInitialized = false;
    appUrl = window.location.origin;

    connectedCallback() {
        this.registerServiceWorker();

        // Setup connectivity change listener
        window.addEventListener('online', this.handleOnlineStatus.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener(
            'online',
            this.handleOnlineStatus.bind(this)
        );

        // Cleanup the visibility change listener
        document.removeEventListener(
            'visibilitychange',
            this._visibilityChangeHandler
        );

        // Disable update checking
        this._updateCheckingEnabled = false;
    }

    // This is called each time the component renders
    // We can use it to periodically check for updates in a LWC-compliant way
    renderedCallback() {
        if (this._updateCheckCallback && this._updateCheckingEnabled) {
            this._updateCheckCallback();
        }
    }

    handleOnlineStatus() {
        console.log('🌐 App is back online, checking for pending operations');
        // Trigger sync of pending operations
        syncPendingOperationsWhenOnline().then((hasPendingOps) => {
            if (hasPendingOps) {
                console.log('🔄 Sync will be triggered for pending operations');
                this.dispatchEvent(new CustomEvent('syncpendingoperations'));
            }
        });
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator && !this.isInitialized) {
            this.isInitialized = true;

            window.addEventListener('load', () => {
                // Use the correct path to service worker - relative to the root
                const swPath = '/serviceWorker.js';

                // Make sure we don't double-register the service worker
                navigator.serviceWorker.getRegistration().then((reg) => {
                    if (reg && reg.active) {
                        console.log(
                            'Service worker is already registered:',
                            reg
                        );
                        // Setup background sync when back online
                        this.setupBackgroundSync(reg);
                        // Listen for messages from service worker
                        this.setupMessageListener();
                        // Check for service worker updates
                        this.checkForUpdates(reg);
                        return;
                    }

                    // Register the service worker
                    navigator.serviceWorker
                        .register(swPath, { scope: '/' })
                        .then((registration) => {
                            console.log(
                                'ServiceWorker registration successful with scope: ',
                                registration.scope
                            );

                            // Setup background sync when back online
                            this.setupBackgroundSync(registration);

                            // Listen for messages from service worker
                            this.setupMessageListener();

                            // Check for service worker updates
                            this.checkForUpdates(registration);
                        })
                        .catch((error) => {
                            console.error(
                                'ServiceWorker registration failed: ',
                                error
                            );
                        });
                });
            });
        }
    }

    checkForUpdates(registration) {
        // Check for service worker updates periodically using a compliant pattern
        // Instead of requestAnimationFrame or setInterval which are not allowed in LWC
        const updateInterval = 60 * 60 * 1000; // 1 hour in milliseconds
        let lastUpdateTime = Date.now();

        // Create a custom property observer that will check for updates
        // during component rendering cycles (compliant with LWC)
        this._updateCheckCallback = () => {
            const currentTime = Date.now();
            if (currentTime - lastUpdateTime >= updateInterval) {
                lastUpdateTime = currentTime;
                registration.update().then(() => {
                    console.log('Service worker update check completed');
                });
            }
        };

        // Add a property that changes periodically to trigger the update check
        // This approach is compliant with LWC's restrictions
        this._updateCheckingEnabled = true;

        // Save the visibility change handler so we can remove it later
        this._visibilityChangeHandler = () => {
            if (
                document.visibilityState === 'visible' &&
                this._updateCheckingEnabled
            ) {
                this._updateCheckCallback();
            }
        };

        // Setup visibility change event to check for updates when tab becomes visible
        document.addEventListener(
            'visibilitychange',
            this._visibilityChangeHandler
        );
    }

    setupBackgroundSync(registration) {
        // Reuse existing periodic sync or create a new one
        if ('periodicSync' in registration) {
            // Check permission
            navigator.permissions
                .query({
                    name: 'periodic-background-sync'
                })
                .then((status) => {
                    if (status.state === 'granted') {
                        registration.periodicSync.register(
                            'sync-pending-operations',
                            {
                                minInterval: 60 * 1000 // Attempt sync every minute
                            }
                        );
                    }
                })
                .catch((err) => {
                    console.log('Periodic sync permission error:', err);
                    // Fallback to regular sync if permission check fails
                    this.performSyncWhenOnline(registration);
                });
        } else {
            // Fallback to regular sync
            this.performSyncWhenOnline(registration);
        }
    }

    performSyncWhenOnline(registration) {
        window.addEventListener('online', () => {
            console.log('🌐 Network is back online, registering sync task');
            if ('sync' in registration) {
                registration.sync
                    .register('sync-pending-operations')
                    .then(() => {
                        console.log(
                            '🔄 Background sync registered successfully'
                        );
                    })
                    .catch((err) => {
                        console.error(
                            'Background sync registration failed:',
                            err
                        );
                        // If background sync fails, attempt manual sync
                        console.log('⚠️ Falling back to manual sync');
                        this.dispatchEvent(
                            new CustomEvent('syncpendingoperations')
                        );
                    });
            } else {
                // Manual sync if background sync not available
                console.log(
                    '⚠️ Background sync not supported, using manual sync'
                );
                this.dispatchEvent(new CustomEvent('syncpendingoperations'));
            }
        });
    }

    setupMessageListener() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('📬 Message received from Service Worker:', event.data);
            if (event.data && event.data.type === 'SYNC_PENDING_OPERATIONS') {
                console.log('🔄 Triggering sync for pending operations');
                this.dispatchEvent(new CustomEvent('syncpendingoperations'));
            }
        });
    }
}
