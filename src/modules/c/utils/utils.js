/**
 * Reduces one or more errors into a string[] of error messages.
 * @param {Error|Error[]} errors
 * @return {String[]} Error messages
 */
export function reduceErrors(errors) {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    return (
        errors
            // Remove null/undefined items
            .filter((error) => !!error)
            // Extract an error message
            .map((error) => {
                // UI API read errors
                if (Array.isArray(error.body)) {
                    return error.body.map((e) => e.message);
                }
                // UI API DML, Apex and network errors
                else if (error.body && typeof error.body.message === 'string') {
                    return error.body.message;
                }
                // JS errors
                else if (typeof error.message === 'string') {
                    return error.message;
                }
                // Unknown error shape so try HTTP status text
                return error.statusText;
            })
            // Flatten
            .reduce((prev, curr) => prev.concat(curr), [])
            // Remove empty strings
            .filter((message) => !!message)
    );
}

/**
 * Formats a date string into a more readable format
 * @param {String} dateString - ISO date string
 * @return {String} Formatted date string
 */
export function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Generates a unique ID
 * @return {String} Unique ID
 */
export function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

/**
 * Combined utilities for offline functionality
 */

// --------------- IndexedDB Storage ---------------

const DB_NAME = 'salesforceOfflineDB';
const DB_VERSION = 1;
export const STORE_NAMES = {
    ACCOUNTS: 'accounts',
    CONTACTS: 'contacts',
    OPPORTUNITIES: 'opportunities',
    CASES: 'cases',
    LEADS: 'leads',
    ASSESSMENTS: 'assessments',
    PENDING_OPERATIONS: 'pendingOperations'
};

let dbInstance = null;

// Initialize the database
function initDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            reject(new Error('Error opening IndexedDB: ' + event.target.error));
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object stores for all data types
            if (!db.objectStoreNames.contains(STORE_NAMES.ACCOUNTS)) {
                db.createObjectStore(STORE_NAMES.ACCOUNTS, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(STORE_NAMES.CONTACTS)) {
                db.createObjectStore(STORE_NAMES.CONTACTS, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(STORE_NAMES.OPPORTUNITIES)) {
                db.createObjectStore(STORE_NAMES.OPPORTUNITIES, {
                    keyPath: 'id'
                });
            }

            if (!db.objectStoreNames.contains(STORE_NAMES.CASES)) {
                db.createObjectStore(STORE_NAMES.CASES, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(STORE_NAMES.LEADS)) {
                db.createObjectStore(STORE_NAMES.LEADS, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(STORE_NAMES.ASSESSMENTS)) {
                db.createObjectStore(STORE_NAMES.ASSESSMENTS, {
                    keyPath: 'id'
                });
            }

            // Create object store for pending operations (offline actions)
            if (!db.objectStoreNames.contains(STORE_NAMES.PENDING_OPERATIONS)) {
                const pendingStore = db.createObjectStore(
                    STORE_NAMES.PENDING_OPERATIONS,
                    {
                        keyPath: 'id',
                        autoIncrement: true
                    }
                );
                pendingStore.createIndex('timestamp', 'timestamp', {
                    unique: false
                });
                pendingStore.createIndex('type', 'type', { unique: false });
            }
        };
    });
}

// Common function to perform database operations
function performOperation(storeName, mode, operation) {
    return initDB().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);

            transaction.oncomplete = () => resolve();
            transaction.onerror = (event) => reject(event.target.error);

            operation(store, resolve, reject);
        });
    });
}

// Get all items from a store
export function getAll(storeName) {
    return performOperation(storeName, 'readonly', (store, resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
    });
}

// Get a single item by ID
export function getById(storeName, id) {
    return performOperation(storeName, 'readonly', (store, resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result);
            } else {
                reject(
                    new Error(`Item with id ${id} not found in ${storeName}`)
                );
            }
        };
    });
}

// Add or update an item
export function saveItem(storeName, item) {
    return performOperation(storeName, 'readwrite', (store, resolve) => {
        store.put(item);
        resolve(item);
    });
}

// Add multiple items at once
export function saveItems(storeName, items) {
    return performOperation(storeName, 'readwrite', (store, resolve) => {
        items.forEach((item) => store.put(item));
        resolve(items);
    });
}

// Delete an item
export function deleteItem(storeName, id) {
    return performOperation(storeName, 'readwrite', (store, resolve) => {
        store.delete(id);
        resolve({ success: true, id });
    });
}

// Add a pending operation for offline sync
export function addPendingOperation(operation) {
    const pendingOp = {
        ...operation,
        timestamp: new Date().toISOString()
    };

    return performOperation(
        STORE_NAMES.PENDING_OPERATIONS,
        'readwrite',
        (store, resolve) => {
            const request = store.add(pendingOp);
            request.onsuccess = () => resolve(pendingOp);
        }
    );
}

// Get all pending operations
export function getPendingOperations() {
    return getAll(STORE_NAMES.PENDING_OPERATIONS);
}

// Delete a pending operation
export function deletePendingOperation(id) {
    return deleteItem(STORE_NAMES.PENDING_OPERATIONS, id);
}

// Clear all pending operations
export function clearPendingOperations() {
    return performOperation(
        STORE_NAMES.PENDING_OPERATIONS,
        'readwrite',
        (store, resolve) => {
            store.clear();
            resolve();
        }
    );
}

// --------------- Connectivity Service ---------------

// Event names for online/offline notifications
export const CONNECTIVITY_EVENTS = {
    ONLINE: 'app_online',
    OFFLINE: 'app_offline',
    STATUS_CHANGE: 'connectivity_status_change'
};

// Custom event dispatcher
function dispatchStatusEvent(onlineStatus) {
    const event = new CustomEvent(CONNECTIVITY_EVENTS.STATUS_CHANGE, {
        detail: { isOnline: onlineStatus },
        bubbles: true,
        composed: true
    });
    document.body.dispatchEvent(event);

    // Also dispatch specific events
    const specificEvent = new CustomEvent(
        onlineStatus ? CONNECTIVITY_EVENTS.ONLINE : CONNECTIVITY_EVENTS.OFFLINE,
        {
            bubbles: true,
            composed: true
        }
    );
    document.body.dispatchEvent(specificEvent);
}

// Initialize listeners
export function initConnectivityListeners() {
    // Setup event listeners for online/offline events
    window.addEventListener('online', () => {
        console.log('🌐 Browser reports online status');
        // Check if we're truly online by testing connection
        testConnection().then((online) => {
            if (online) {
                console.log(
                    '✅ Connection test succeeded, dispatching online event'
                );
                dispatchStatusEvent(true);

                // Automatically sync pending operations when coming back online
                syncPendingOperationsWhenOnline();
            }
        });
    });

    window.addEventListener('offline', () => {
        console.log('📴 Browser reports offline status');
        dispatchStatusEvent(false);
    });

    // Initial check
    if (navigator.onLine) {
        testConnection().then((online) => {
            dispatchStatusEvent(online);
        });
    } else {
        dispatchStatusEvent(false);
    }
}

// Attempt to sync pending operations when coming back online
export function syncPendingOperationsWhenOnline() {
    if (!isOnline()) {
        console.log('📴 Cannot sync while offline');
        return Promise.resolve(false);
    }

    console.log('🔄 Checking for pending operations to sync');
    return getPendingOperations().then((operations) => {
        if (operations && operations.length > 0) {
            console.log(
                `🔄 Found ${operations.length} pending operations to sync`
            );
            // Dispatch an event to trigger sync in the app component
            const syncEvent = new CustomEvent('sync-pending-operations', {
                bubbles: true,
                composed: true
            });
            document.body.dispatchEvent(syncEvent);
            return true;
        }

        console.log('✅ No pending operations to sync');
        return false;
    });
}

// Get current online status
export function isOnline() {
    return navigator.onLine;
}

// Test connection with a lightweight ping
export function testConnection() {
    // Simple fetch to test connectivity - use a minimal endpoint
    return fetch('/ping', {
        method: 'HEAD',
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache'
        }
    })
        .then(() => true)
        .catch(() => false);
}

// Register for connectivity status changes
export function addConnectivityListener(callback) {
    document.body.addEventListener(
        CONNECTIVITY_EVENTS.STATUS_CHANGE,
        (event) => {
            callback(event.detail.isOnline);
        }
    );
}

// Remove connectivity listener
export function removeConnectivityListener(callback) {
    document.body.removeEventListener(
        CONNECTIVITY_EVENTS.STATUS_CHANGE,
        callback
    );
}
