// Register event listeners for connectivity changes
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 Initializing offline sync functionality');

    // Listen for app specific connectivity events
    document.body.addEventListener('app_online', handleOnlineEvent);
    document.body.addEventListener('app_offline', handleOfflineEvent);

    // Listen for sync events from service worker
    document.body.addEventListener('sync-from-service-worker', handleSyncEvent);

    // Listen for visibility changes to trigger sync when tab becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for native online/offline events
    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);

    // Initial connectivity check
    checkConnectivity();
});

// Function to check connectivity
function checkConnectivity() {
    const isOnline = navigator.onLine;
    console.log(
        `🌐 Current connectivity status: ${isOnline ? 'Online' : 'Offline'}`
    );

    // If online, try to sync any pending operations
    if (isOnline) {
        triggerSync();
    }
}

// Handle online events - no need to use the event parameter
function handleOnlineEvent() {
    console.log('🌐 App has detected online connectivity');

    // When we come back online, attempt to sync pending operations
    triggerSync();
}

// Handle offline events - no need to use the event parameter
function handleOfflineEvent() {
    console.log(
        '🌐 App has detected offline state, operations will be stored locally'
    );
}

// Handle sync request events - no need to use the event parameter
function handleSyncEvent() {
    console.log(
        '🔄 Sync requested from service worker, processing pending operations'
    );
    // Perform actual sync operations here without triggering another sync event
    performSync();
}

// Handle visibility change events
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        console.log('🔄 Page became visible, checking for pending operations');
        if (navigator.onLine) {
            triggerSync();
        }
    }
}

// Perform actual sync operations
function performSync() {
    console.log('🔄 Processing pending operations');
    // Your actual sync logic here
    // This function should NOT dispatch another sync event
}

// Trigger sync operations
function triggerSync() {
    console.log('🔄 Triggering sync for pending operations');

    // Only dispatch an event to the service worker, not to the page itself
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SYNC_PENDING_OPERATIONS'
        });
    } else {
        // No service worker, perform sync directly
        performSync();
    }
}

// Export functions for use in other scripts
window.offlineSync = {
    checkConnectivity,
    triggerSync
};
