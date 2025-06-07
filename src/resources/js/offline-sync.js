// Register event listeners for connectivity changes
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 Initializing offline sync functionality');

    // Listen for app specific connectivity events
    document.body.addEventListener('app_online', handleOnlineEvent);
    document.body.addEventListener('app_offline', handleOfflineEvent);

    // Listen for sync events
    document.body.addEventListener('sync-pending-operations', handleSyncEvent);

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
    console.log('🔄 Sync requested, triggering sync operations');
    triggerSync();
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

// Trigger sync operations
function triggerSync() {
    console.log('🔄 Triggering sync for pending operations');

    // Dispatch custom event to app component
    const syncEvent = new CustomEvent('sync-pending-operations', {
        bubbles: true,
        composed: true
    });
    document.body.dispatchEvent(syncEvent);
}

// Export functions for use in other scripts
window.offlineSync = {
    checkConnectivity,
    triggerSync
};
