import { LightningElement, track } from 'lwc';
import * as accountService from 'c/accountService';
import * as contactService from 'c/contactService';
// import { debugSyncAssessments } from 'c/utils';

export default class App extends LightningElement {
    @track currentView = 'accounts'; // Default view
    @track syncingAccounts = false;
    @track syncingContacts = false;
    @track contentClass = 'slds-m-around_medium';
    @track isLoading = true;

    connectedCallback() {
        // Initialize offline storage with mock data
        // ();debugSyncAssessments
        this.initializeOfflineStorage().then(() => {
            // Ensure both components load their data from storage
            setTimeout(() => {
                const accountManager =
                    this.template.querySelector('c-account-manager');
                const contactManager =
                    this.template.querySelector('c-contact-manager');

                if (accountManager) {
                    accountManager.loadAccounts();
                }

                if (contactManager) {
                    contactManager.loadContacts();
                }
            }, 1000);
        });

        // Listen for service worker sync events
        this.addEventListener(
            'sync-pending-operations',
            this.handleSyncOperations
        );

        // Listen for connectivity status changes
        this.addEventListener('sync-needed', this.handleSyncNeeded);

        // Initialize connectivity listeners
        import('c/utils').then((utils) => {
            utils.initConnectivityListeners();
            utils.addConnectivityListener(
                this.handleConnectivityChange.bind(this)
            );
        });

        // Set loading to false after a short delay
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }

    disconnectedCallback() {
        this.removeEventListener(
            'sync-pending-operations',
            this.handleSyncOperations
        );
        this.removeEventListener('sync-needed', this.handleSyncNeeded);

        // Remove connectivity listener
        import('c/utils').then((utils) => {
            utils.removeConnectivityListener(
                this.handleConnectivityChange.bind(this)
            );
        });
    }

    // Initialize offline storage with mock data if empty
    initializeOfflineStorage() {
        console.log('🔄 Initializing offline storage...');

        // First ensure IndexedDB is supported
        if (!window.indexedDB) {
            console.error("❌ Your browser doesn't support IndexedDB");
            return Promise.reject(new Error('IndexedDB not supported'));
        }

        return Promise.all([
            accountService.initializeOfflineStorage(),
            contactService.initializeOfflineStorage()
        ])
            .then((results) => {
                const [accounts, contacts] = results;
                console.log(
                    `✅ Offline storage initialized successfully with ${accounts.length} accounts and ${contacts.length} contacts`
                );

                // After initialization, check for pending operations
                return import('c/utils').then((utils) => {
                    return utils.getPendingOperations().then((operations) => {
                        if (operations && operations.length > 0) {
                            console.log(
                                `🔄 Found ${operations.length} pending operations to sync`
                            );
                            // If we're online, trigger a sync
                            if (utils.isOnline()) {
                                this.handleSyncOperations();
                            }
                        }
                        return {
                            accounts,
                            contacts,
                            pendingOperations: operations || []
                        };
                    });
                });
            })
            .catch((error) => {
                console.error('❌ Error initializing offline storage:', error);
                throw error;
            });
    }

    // Handle sync operations when coming back online
    handleSyncOperations() {
        console.log('🔄 Starting sync operations...');
        // Get connectivity status component
        const connectivityStatus = this.template.querySelector(
            'c-connectivity-status'
        );

        if (connectivityStatus) {
            connectivityStatus.handleSyncStart();
        }

        // Sync accounts and contacts
        this.syncingAccounts = true;
        this.syncingContacts = true;

        // Start both sync operations in parallel
        Promise.all([
            accountService.syncPendingOperations().then((result) => {
                this.syncingAccounts = false;
                console.log('✅ Account sync completed:', result);
                return result;
            }),
            contactService.syncPendingOperations().then((result) => {
                this.syncingContacts = false;
                console.log('✅ Contact sync completed:', result);
                return result;
            })
        ])
            .then(([accountResult, contactResult]) => {
                // Calculate total synced operations
                const synced =
                    (accountResult.synced || 0) + (contactResult.synced || 0);
                const total =
                    (accountResult.total || 0) + (contactResult.total || 0);

                console.log(
                    `🔄 Sync complete: ${synced}/${total} operations processed`
                );

                // Notify user of sync completion
                if (connectivityStatus) {
                    connectivityStatus.handleSyncComplete({
                        detail: { synced, total }
                    });
                }

                // Refresh UI if needed
                if (synced > 0) {
                    this.refreshCurrentView();
                }
            })
            .catch((error) => {
                console.error('❌ Error syncing pending operations:', error);

                // Notify user of sync error
                if (connectivityStatus) {
                    connectivityStatus.handleSyncError({
                        detail: { message: error.message || 'Unknown error' }
                    });
                }

                this.syncingAccounts = false;
                this.syncingContacts = false;
            });
    }

    // Handle sync needed event
    handleSyncNeeded() {
        console.log('🔄 Sync needed - initiating sync operations');
        this.handleSyncOperations();
    }

    // Refresh the current view after syncing
    refreshCurrentView() {
        console.log('🔄 Refreshing current view:', this.currentView);
        const currentViewComponent = this.isAccountView
            ? this.template.querySelector('c-account-manager')
            : this.template.querySelector('c-contact-manager');

        if (currentViewComponent) {
            if (this.isAccountView) {
                currentViewComponent.loadAccounts();
            } else {
                currentViewComponent.loadContacts();
            }
        }
    }

    // Handle new account
    handleNewAccount() {
        console.log('➕ Creating new account from app component');
        const accountManager = this.template.querySelector('c-account-manager');
        if (accountManager) {
            accountManager.handleNewAccount();
        } else {
            console.error('Could not find account manager component');
        }
    }

    // Handle tab selection
    handleTabSelect(event) {
        const tabId = event.currentTarget.id;

        if (tabId === 'accounts-tab') {
            this.currentView = 'accounts';
        } else if (tabId === 'contacts-tab') {
            this.currentView = 'contacts';
        }
    }

    // Handle new contact button click from contacts tab
    handleNewContact() {
        console.log('➕ Creating new contact');
        const contactManager = this.template.querySelector('c-contact-manager');
        if (contactManager) {
            // Call the correct method that exists on the component
            contactManager.handleNewContact();
        } else {
            console.error('Could not find contact manager component');
        }
    }

    // Handle contact edit from account view
    handleEditContact(event) {
        console.log('✏️ Editing contact:', event.detail.contactId);
        this.currentView = 'contacts';

        // Allow the DOM to update
        setTimeout(() => {
            const contactManager =
                this.template.querySelector('c-contact-manager');
            if (contactManager) {
                contactManager.handleEditContactById(event.detail.contactId);
            }
        }, 0);
    }

    // Handle view accounts
    handleViewAccounts() {
        console.log('👁️ Switching to Accounts view');
        this.currentView = 'accounts';
    }

    // Handle view contacts
    handleViewContacts() {
        console.log('👁️ Switching to Contacts view');
        this.currentView = 'contacts';
    }

    // Handle view assessments (placeholder)
    handleViewAssessments() {
        console.log('👁️ Assessments view not implemented yet');

        // Get connectivity status component for toast notification
        const connectivityStatus = this.template.querySelector(
            'c-connectivity-status'
        );
        if (connectivityStatus) {
            // Show an info notification instead of alert
            connectivityStatus.handleSyncComplete({
                detail: {
                    message: 'Assessments feature coming soon!',
                    variant: 'info'
                }
            });
        }
    }

    // Handle edit success notifications from child components
    handleEditSuccess(event) {
        console.log('✅ Edit operation successful:', event);
        // Get connectivity status component
        const connectivityStatus = this.template.querySelector(
            'c-connectivity-status'
        );

        if (connectivityStatus) {
            // Show a success toast
            connectivityStatus.handleSyncComplete({
                detail: {
                    synced: 1,
                    total: 1
                }
            });
        }
    }

    // Handle new contact from account view
    handleNewContactFromAccount(event) {
        console.log(
            '➕ Creating new contact for account:',
            event.detail.accountId
        );
        this.currentView = 'contacts';

        // Allow the DOM to update
        setTimeout(() => {
            const contactManager =
                this.template.querySelector('c-contact-manager');
            if (contactManager) {
                contactManager.handleNewContactForAccount(
                    event.detail.accountId
                );
            }
        }, 0);
    }

    // Computed properties for conditional rendering
    get isAccountView() {
        return this.currentView === 'accounts';
    }

    get isContactView() {
        return this.currentView === 'contacts';
    }

    // Computed classes for tabs
    get accountsTabClass() {
        return this.isAccountView ? 'nav-item active' : 'nav-item';
    }

    get contactsTabClass() {
        return this.isContactView ? 'nav-item active' : 'nav-item';
    }

    get accountsTabIndex() {
        return this.isAccountView ? '0' : '-1';
    }

    get contactsTabIndex() {
        return this.isContactView ? '0' : '-1';
    }

    get currentViewTitle() {
        return this.isAccountView ? 'Accounts' : 'Contacts';
    }

    get currentViewDescription() {
        return this.isAccountView
            ? 'Manage your business accounts'
            : 'Manage your contacts';
    }

    get currentViewIcon() {
        return this.isAccountView ? 'standard:account' : 'standard:contact';
    }

    // Handle connectivity changes
    handleConnectivityChange(isOnline) {
        console.log(`🌐 Connectivity changed. Online: ${isOnline}`);

        // Get connectivity status component
        const connectivityStatus = this.template.querySelector(
            'c-connectivity-status'
        );

        if (connectivityStatus) {
            if (isOnline) {
                connectivityStatus.handleOnline();
                // Trigger sync when coming back online
                this.handleSyncOperations();
            } else {
                connectivityStatus.handleOffline();
            }
        }
    }
}
