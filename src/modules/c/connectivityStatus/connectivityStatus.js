import { LightningElement, track, api } from 'lwc';
import {
    isOnline,
    addConnectivityListener,
    removeConnectivityListener,
    getPendingOperations
} from 'c/utils';

/**
 * Component to display the online/offline status and sync status
 */
export default class ConnectivityStatus extends LightningElement {
    @track isOnline = true;
    @track syncStatus = 'idle'; // idle, syncing, completed, error
    @track syncMessage = '';
    @track showToast = false;
    @track pendingOperationsCount = 0;

    // Timer for checking pending operations
    pendingCheckInterval = null;

    connectedCallback() {
        // Initialize with current status
        this.isOnline = isOnline();

        // Listen for connectivity changes
        this._onConnectivityChange = this.handleConnectivityChange.bind(this);
        addConnectivityListener(this._onConnectivityChange);

        // Check for pending operations
        this.checkPendingOperations();

        // Set up interval to check pending operations
        this.pendingCheckInterval = setInterval(() => {
            this.checkPendingOperations();
        }, 30000); // Check every 30 seconds
    }

    disconnectedCallback() {
        removeConnectivityListener(this._onConnectivityChange);

        // Clear interval
        if (this.pendingCheckInterval) {
            clearInterval(this.pendingCheckInterval);
        }
    }

    // Explicitly handle going online
    @api
    handleOnline() {
        this.isOnline = true;
        this.showToast = true;
        this.syncMessage = 'You are back online. Syncing changes...';

        // Hide toast after 5 seconds
        setTimeout(() => {
            this.showToast = false;
        }, 5000);

        // Check pending operations
        this.checkPendingOperations();
        console.log('🟢 [ConnectivityStatus] Online');
    }

    // Explicitly handle going offline
    @api
    handleOffline() {
        this.isOnline = false;
        this.showToast = true;
        this.syncMessage =
            'You are offline. Changes will be saved locally and synced when you reconnect.';

        // Keep offline message visible longer
        setTimeout(() => {
            this.showToast = false;
        }, 5000);

        // Check pending operations
        this.checkPendingOperations();
        console.log('🔴 [ConnectivityStatus] Offline');
    }

    handleConnectivityChange(onlineStatus) {
        this.isOnline = onlineStatus;

        if (onlineStatus) {
            this.handleOnline();
            // Dispatch event to trigger sync
            this.dispatchEvent(new CustomEvent('sync-needed'));
        } else {
            this.handleOffline();
        }
    }
    @api
    handleSyncStart() {
        this.syncStatus = 'syncing';
        this.syncMessage = 'Syncing your changes...';
        this.showToast = true;
        console.log('🔄 [ConnectivityStatus] Sync started');
    }

    @api
    handleSyncComplete(event) {
        console.log('✅ [ConnectivityStatus] Sync complete', event);
        const { synced, total, message, variant } = event.detail || {
            synced: 0,
            total: 0
        };

        // If message is provided, use it as a custom notification
        if (message) {
            this.syncStatus = variant || 'completed';
            this.syncMessage = message;
            this.showToast = true;

            // Hide toast after delay
            setTimeout(() => {
                this.showToast = false;
                this.syncStatus = 'idle';
            }, 3000);
            return;
        }

        this.syncStatus = 'completed';
        this.syncMessage = `Successfully synced ${synced} of ${total} changes.`;
        this.showToast = true;

        // Refresh pending operations count
        this.checkPendingOperations();

        // Hide toast after 3 seconds
        setTimeout(() => {
            this.showToast = false;
            this.syncStatus = 'idle';
        }, 3000);
    }

    @api
    handleSyncError(event) {
        console.error('❌ [ConnectivityStatus] Sync error', event);
        const { message } = event.detail || { message: 'Unknown error' };

        this.syncStatus = 'error';
        this.syncMessage = `Sync error: ${message}`;
        this.showToast = true;

        // Hide toast after 5 seconds
        setTimeout(() => {
            this.showToast = false;
            this.syncStatus = 'idle';
        }, 5000);
    }

    closeToast() {
        this.showToast = false;
    }

    checkPendingOperations() {
        // Check pending operations from the utils module
        getPendingOperations()
            .then((operations) => {
                this.pendingOperationsCount = operations
                    ? operations.length
                    : 0;
            })
            .catch((error) => {
                console.error('Error checking pending operations:', error);
            });
    }

    get statusClass() {
        return this.isOnline
            ? 'status-indicator online'
            : 'status-indicator offline';
    }

    get statusText() {
        return this.isOnline ? 'Online' : 'Offline';
    }

    get hasPendingOperations() {
        return this.pendingOperationsCount > 0;
    }

    get pendingOperationsText() {
        return `${this.pendingOperationsCount} pending ${this.pendingOperationsCount === 1 ? 'change' : 'changes'}`;
    }

    get toastClass() {
        if (this.syncStatus === 'error') {
            return 'toast error';
        } else if (this.syncStatus === 'completed') {
            return 'toast success';
        } else if (!this.isOnline) {
            return 'toast warning';
        }
        return 'toast info';
    }
}
