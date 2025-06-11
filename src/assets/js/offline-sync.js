// src/assets/js/offline-sync.js

(function () {
    console.log('✅ offline-sync.js loaded');

    // Check for globals
    if (!window.offlineUtils || !window.syncHandlers) {
        console.error(
            '❌ offline-sync.js: Required globals missing (offlineUtils or syncHandlers)'
        );
        return;
    }

    const {
        // getPendingOperations,
        // deletePendingOperation,
        isOnline
    } = window.offlineUtils;
    // const syncHandlers = window.syncHandlers;

    // async function performSync() {
    //     if (!isOnline()) {
    //         console.log('📴 Still offline — skipping sync');
    //         return;
    //     }

    //     const operations = await getPendingOperations();
    //     console.log('📦 Pending operations:', operations);

    //     if (!operations.length) {
    //         console.log('✅ No operations to sync');
    //         return;
    //     }

    //     const sortedOps = operations.sort(
    //         (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    //     );

    //     for (const op of sortedOps) {
    //         const { type, data, id } = op;
    //         console.log(`🔄 Processing operation: ${type} (ID: ${id})`);

    //         const handler = syncHandlers[`sync${type}`];
    //         if (typeof handler !== 'function') {
    //             console.warn(`⚠️ No sync handler found for type: ${type}`);
    //             continue;
    //         }

    //         try {

    //             console.log(`✅ Synced & removed operation: ${type} (ID: ${id})`);
    //         } catch (err) {
    //             console.error(
    //                 `❌ Failed to sync operation ${type} (ID: ${id}):`,
    //                 err.message || err
    //             );
    //         }
    //     }
    // }

    // Register sync triggers
    document.body.addEventListener('sync-pending-operations', () => {
        console.log('🔁 sync-pending-operations event received');
        // performSync();
    });

    window.addEventListener('online', () => {
        console.log('🌐 Network online event detected, triggering sync');
        // performSync();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && isOnline()) {
            console.log('👁️ Page visible and online, triggering sync');
            // performSync();
        }
    });

    // Trigger initial check
    if (isOnline()) {
        console.log('🚀 App started online, triggering initial sync');
        // performSync();
    } else {
        console.log('📴 App started offline, will wait to sync');
    }

    // Expose to global if needed
    window.offlineSync = {
        // performSync
    };
})();
