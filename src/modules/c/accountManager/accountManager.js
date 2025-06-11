import { LightningElement, track, api } from 'lwc';
import * as accountService from 'c/accountService';
import * as contactService from 'c/contactService';
import { isOnline } from 'c/utils';

const VIEW_STATES = {
    LIST: 'list',
    FORM: 'form',
    DETAIL: 'detail'
};

export default class AccountManager extends LightningElement {
    @track accounts = [];
    @track currentAccount = {};
    @track relatedContacts = [];
    @track error = null;
    @track isLoading = true;
    @track viewState = VIEW_STATES.LIST;
    @track isNew = false;
    @track showDeleteConfirmation = false;
    @track itemToDeleteId = null;
    @track deleteType = '';
    @track pendingOperations = [];
    @track selectedAccountId;
    @track offlineAccountIds = [];
    @api hideNewButton = false;

    // Getters for form and UI
    get formTitle() {
        return this.isNew ? 'New Account' : 'Edit Account';
    }

    get showAccountList() {
        return this.viewState === VIEW_STATES.LIST;
    }

    get showAccountForm() {
        return this.viewState === VIEW_STATES.FORM;
    }

    get showAccountDetail() {
        return this.viewState === VIEW_STATES.DETAIL;
    }

    get formattedCreatedDate() {
        return this.formatDate(this.currentAccount.createdDate);
    }

    get formattedModifiedDate() {
        return this.formatDate(this.currentAccount.lastModifiedDate);
    }

    get deleteConfirmationMessage() {
        return this.deleteType === 'account'
            ? 'Are you sure you want to delete this account? This will also delete all related contacts.'
            : 'Are you sure you want to delete this contact?';
    }

    // Add a getter for empty accounts check
    get hasAccounts() {
        return this.accounts.length > 0;
    }

    // Check if we have related contacts
    get hasRelatedContacts() {
        return this.relatedContacts && this.relatedContacts.length > 0;
    }

    connectedCallback() {
        this.loadAccounts();
        // Listen for connectivity changes
        window.addEventListener(
            'online',
            this.handleOnlineStatusChange.bind(this)
        );
        window.addEventListener(
            'offline',
            this.handleOnlineStatusChange.bind(this)
        );
    }

    disconnectedCallback() {
        window.removeEventListener(
            'online',
            this.handleOnlineStatusChange.bind(this)
        );
        window.removeEventListener(
            'offline',
            this.handleOnlineStatusChange.bind(this)
        );
    }

    handleOnlineStatusChange() {
        // Refresh the view when connectivity changes
        this.loadAccounts();
    }

    // Handle selecting an account
    handleAccountSelect(event) {
        this.selectedAccountId = event.currentTarget.dataset.id;
    }

    // Class getter for account items
    getAccountItemClass(accountId) {
        return this.offlineAccountIds.includes(accountId)
            ? 'account-item offline-record'
            : 'account-item';
    }

    // API Methods
    @api
    loadAccountDetails(accountId) {
        this.isLoading = true;
        this.error = null;

        Promise.all([
            accountService.getAccount(accountId),
            contactService.getContactsByAccountId(accountId)
        ])
            .then(([account, contacts]) => {
                this.currentAccount = account;
                this.relatedContacts = contacts.map((contact) => ({
                    ...contact,
                    emailHref: `mailto:${contact.email}`
                }));
                this.viewState = VIEW_STATES.DETAIL;
                this.isLoading = false;
            })
            .catch((error) => {
                this.error = error.message || 'Error loading account details';
                this.isLoading = false;
            });
    }

    // Add getter methods for each account to handle the classes
    getAccountClass(accountId) {
        // Instead of returning a computed value, we'll pass this to the template
        // This is a solution to avoid using expressions in HTML attributes
        return {
            accountId,
            isOffline: this.isOfflineRecord(accountId)
        };
    }

    // Process each account to add a CSS class property for UI display
    processAccounts(accounts) {
        return accounts.map((account) => {
            const isOffline = this.isOfflineRecord(account.id);
            return {
                ...account,
                cssClass: isOffline
                    ? 'account-item offline-record'
                    : 'account-item',
                isOffline: isOffline
            };
        });
    }

    // DATA LOADING METHODS
    loadAccounts() {
        this.isLoading = true;
        this.error = null;

        // Get pending operations to highlight offline records
        this.loadPendingOperations();

        accountService
            .getAccounts()
            .then((result) => {
                // Process accounts to add CSS classes
                this.accounts = this.processAccounts(result);
                this.viewState = VIEW_STATES.LIST;
            })
            .catch((error) => {
                this.error =
                    error.message || 'Unknown error retrieving accounts';
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Process accounts to identify which ones have offline changes
    processOfflineAccounts() {
        if (!isOnline()) {
            const offlineIds = [];
            this.pendingOperations.forEach((op) => {
                if (
                    ['CREATE_ACCOUNT', 'UPDATE_ACCOUNT'].includes(op.type) &&
                    op.data &&
                    op.data.id
                ) {
                    offlineIds.push(op.data.id);
                }
            });
            this.offlineAccountIds = offlineIds;
            console.log('Offline account IDs:', offlineIds);
        } else {
            this.offlineAccountIds = [];
        }
    }

    // Load pending operations to highlight offline records
    loadPendingOperations() {
        // Only check for pending operations when offline
        if (!isOnline()) {
            import('c/utils').then((utils) => {
                utils.getPendingOperations().then((operations) => {
                    this.pendingOperations = operations.filter((op) =>
                        [
                            'CREATE_ACCOUNT',
                            'UPDATE_ACCOUNT',
                            'DELETE_ACCOUNT'
                        ].includes(op.type)
                    );
                    console.log(
                        '📝 Found pending operations:',
                        this.pendingOperations
                    );

                    // Process accounts again with the updated pending operations
                    if (this.accounts && this.accounts.length) {
                        this.accounts = this.processAccounts(this.accounts);
                    }
                });
            });
        } else {
            this.pendingOperations = [];
            this.offlineAccountIds = [];
        }
    }

    // Check if an account has pending operations
    isOfflineRecord(accountId) {
        return this.offlineAccountIds.includes(accountId);
    }

    // EVENT HANDLERS
    handleFieldChange(event) {
        const field = event.target.dataset.field;
        this.currentAccount = {
            ...this.currentAccount,
            [field]: event.target.value
        };
    }

    handleNewAccount() {
        console.log('Opening new account form');
        this.currentAccount = {
            name: '',
            industry: '',
            type: '',
            website: '',
            phone: '',
            description: ''
        };
        this.isNew = true;
        this.viewState = VIEW_STATES.FORM;
    }

    handleSave() {
        console.log('Saving account:', this.currentAccount);
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;
        const actionType = this.isNew ? 'create' : 'update';

        const savePromise = this.isNew
            ? accountService.createAccount(this.currentAccount)
            : accountService.updateAccount(this.currentAccount);

        savePromise
            .then((result) => {
                console.log('Account saved successfully:', result);
                // Reset form state
                this.viewState = VIEW_STATES.LIST;

                // Fire success event
                this.dispatchEvent(
                    new CustomEvent('editsuccess', {
                        detail: {
                            type: 'account',
                            action: actionType,
                            id: result.id,
                            name: result.name
                        }
                    })
                );

                // Refresh the account list
                return this.loadAccounts();
            })
            .catch((error) => {
                this.error =
                    error.message ||
                    `Unknown error ${
                        this.isNew ? 'creating' : 'updating'
                    } the account`;
            })
            .finally(() => {
                this.isLoading = false;
                // Reset isNew flag after save operation completes
                this.isNew = false;
            });
    }

    handleCancel() {
        this.viewState = VIEW_STATES.LIST;
        this.error = null;
    }

    handleViewAccount(event) {
        event.preventDefault();
        const accountId = event.target.dataset.id;
        this.loadAccountDetails(accountId);
    }

    handleEditAccount(event) {
        const accountId = event.currentTarget.dataset.id;
        if (!accountId) {
            console.error('No account ID found in event', event);
            return;
        }

        this.isLoading = true;

        accountService
            .getAccount(accountId)
            .then((account) => {
                this.currentAccount = account;
                this.isNew = false;
                this.viewState = VIEW_STATES.FORM;
            })
            .catch((error) => {
                this.error = error.message || 'Error loading account for edit';
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleDeleteAccount() {
        const accountId = this.currentAccount.id;
        if (!accountId) {
            this.error = 'No account selected for deletion';
            return;
        }

        this.itemToDeleteId = accountId;
        this.deleteType = 'account';
        this.showDeleteConfirmation = true;
    }

    handleConfirmDelete() {
        this.showDeleteConfirmation = false;

        if (this.deleteType === 'account') {
            this.deleteAccount(this.itemToDeleteId);
        } else if (this.deleteType === 'contact') {
            this.deleteContactRecord(this.itemToDeleteId);
        }

        this.itemToDeleteId = null;
        this.deleteType = '';
    }

    handleCancelDelete() {
        this.showDeleteConfirmation = false;
        this.itemToDeleteId = null;
        this.deleteType = '';
    }

    deleteAccount(accountId) {
        this.isLoading = true;
        this.error = null;

        accountService
            .deleteAccount(accountId)
            .then(() => {
                this.viewState = VIEW_STATES.LIST;
                this.loadAccounts();
                // Dispatch delete success event
                this.dispatchEvent(
                    new CustomEvent('editsuccess', {
                        detail: {
                            type: 'account',
                            action: 'delete',
                            id: accountId
                        }
                    })
                );
            })
            .catch((error) => {
                this.error = error.message || 'Error deleting account';
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleBackToList() {
        this.viewState = VIEW_STATES.LIST;
        // Dispatch viewaccounts event
        this.dispatchEvent(new CustomEvent('viewaccounts'));
    }

    handleViewContacts(event) {
        const accountId = event.target.dataset.id;
        this.loadAccountDetails(accountId);
    }

    handleNewContact() {
        if (!this.currentAccount || !this.currentAccount.id) {
            console.error('No account selected or account ID is missing');
            return;
        }

        // Dispatch event to open contact form with pre-populated accountId
        const selectEvent = new CustomEvent('newcontact', {
            detail: { accountId: this.currentAccount.id }
        });
        this.dispatchEvent(selectEvent);
    }

    handleEditContact(event) {
        const contactId = event.target.dataset.id;
        // Dispatch event to open contact form with this contact for editing
        const selectEvent = new CustomEvent('editcontact', {
            detail: { contactId }
        });
        this.dispatchEvent(selectEvent);
    }

    handleDeleteContact(event) {
        const contactId = event.target.dataset.id;
        this.itemToDeleteId = contactId;
        this.deleteType = 'contact';
        this.showDeleteConfirmation = true;
    }

    deleteContactRecord(contactId) {
        this.isLoading = true;
        this.error = null;

        contactService
            .deleteContact(contactId)
            .then(() => {
                // Refresh the related contacts
                return contactService.getContactsByAccountId(
                    this.currentAccount.id
                );
            })
            .then((contacts) => {
                this.relatedContacts = contacts.map((contact) => ({
                    ...contact,
                    emailHref: `mailto:${contact.email}`
                }));

                // Dispatch delete success event
                this.dispatchEvent(
                    new CustomEvent('editsuccess', {
                        detail: {
                            type: 'contact',
                            action: 'delete',
                            id: contactId
                        }
                    })
                );
            })
            .catch((error) => {
                this.error = error.message || 'Error deleting contact';
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // UTILITY METHODS
    validateForm() {
        // Basic validation
        if (
            !this.currentAccount.name ||
            this.currentAccount.name.trim() === ''
        ) {
            this.error = 'Account Name is required';
            return false;
        }
        return true;
    }

    formatDate(dateString) {
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
}
