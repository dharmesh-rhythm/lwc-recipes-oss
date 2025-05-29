import { LightningElement, track, api } from 'lwc';
import * as contactService from 'data/services/contactService';
import * as accountService from 'data/services/accountService';

const VIEW_STATES = {
    LIST: 'list',
    FORM: 'form',
    DETAIL: 'detail'
};

export default class ContactManager extends LightningElement {
    @track contacts = [];
    @track accounts = [];
    @track currentContact = {};
    @track accountMap = {};
    @track error = null;
    @track isLoading = false;
    @track viewState = VIEW_STATES.LIST;
    @track isNew = false;
    @track selectedAccountId = null;
    @track showDeleteConfirmation = false;
    @track itemToDeleteId = null;

    connectedCallback() {
        this.loadContacts();
        this.loadAccounts();
    }

    // API Methods
    @api
    handleNewContactForAccount(accountId) {
        this.currentContact = { accountId };
        this.selectedAccountId = accountId;
        this.isNew = true;
        this.viewState = VIEW_STATES.FORM;
    }

    @api
    handleEditContactById(contactId) {
        this.isLoading = true;

        contactService
            .getContact(contactId)
            .then((contact) => {
                this.currentContact = contact;
                this.selectedAccountId = contact.accountId;
                this.isNew = false;
                this.viewState = VIEW_STATES.FORM;
                this.isLoading = false;
            })
            .catch((error) => {
                this.error = error.message || 'Error loading contact for edit';
                this.isLoading = false;
            });
    }

    @api
    loadContactDetails(contactId) {
        this.isLoading = true;
        this.error = null;

        contactService
            .getContact(contactId)
            .then((contact) => {
                this.currentContact = contact;
                this.viewState = VIEW_STATES.DETAIL;
                this.isLoading = false;
            })
            .catch((error) => {
                this.error = error.message || 'Error loading contact details';
                this.isLoading = false;
            });
    }

    // COMPUTED PROPERTIES
    get showContactList() {
        return this.viewState === VIEW_STATES.LIST;
    }

    get showContactForm() {
        return this.viewState === VIEW_STATES.FORM;
    }

    get showContactDetail() {
        return this.viewState === VIEW_STATES.DETAIL;
    }

    get formattedCreatedDate() {
        return this.formatDate(this.currentContact.createdDate);
    }

    get formattedModifiedDate() {
        return this.formatDate(this.currentContact.lastModifiedDate);
    }

    get emailHref() {
        return this.currentContact.email
            ? `mailto:${this.currentContact.email}`
            : '#';
    }

    get accountName() {
        return this.currentContact.accountId
            ? this.accountMap[this.currentContact.accountId]
            : '';
    }

    get isAccountSelected() {
        return this.selectedAccountId === this.currentContact.accountId;
    }

    get deleteConfirmationMessage() {
        return 'Are you sure you want to delete this contact?';
    }

    // DATA LOADING METHODS
    loadContacts() {
        this.isLoading = true;
        this.error = null;

        contactService
            .getContacts()
            .then((result) => {
                this.contacts = result.map((contact) => ({
                    ...contact,
                    accountName: this.accountMap[contact.accountId] || '',
                    emailHref: contact.email ? `mailto:${contact.email}` : '#'
                }));
                this.isLoading = false;
            })
            .catch((error) => {
                this.error = error.message || 'Error loading contacts';
                this.isLoading = false;
            });
    }

    loadAccounts() {
        this.isLoading = true;

        accountService
            .getAccounts()
            .then((result) => {
                this.accounts = result;
                // Create a map of account ids to names for quick lookup
                this.accountMap = result.reduce((map, account) => {
                    map[account.id] = account.name;
                    return map;
                }, {});

                // Update contacts with account names
                this.contacts = this.contacts.map((contact) => ({
                    ...contact,
                    accountName: this.accountMap[contact.accountId] || ''
                }));

                this.isLoading = false;
            })
            .catch((error) => {
                this.error = error.message || 'Error loading accounts';
                this.isLoading = false;
            });
    }

    // EVENT HANDLERS
    handleFieldChange(event) {
        const field = event.target.dataset.field;
        this.currentContact = {
            ...this.currentContact,
            [field]: event.target.value
        };
    }

    handleNewContact() {
        this.currentContact = {};
        this.isNew = true;
        this.viewState = VIEW_STATES.FORM;
    }

    handleSave() {
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;
        this.error = null;

        const saveOperation = this.isNew
            ? contactService.createContact(this.currentContact)
            : contactService.updateContact(this.currentContact);

        saveOperation
            .then(() => {
                this.loadContacts();
                this.viewState = VIEW_STATES.LIST;

                // Dispatch success event
                this.dispatchEvent(
                    new CustomEvent('editsuccess', {
                        detail: {
                            type: 'contact',
                            id: this.currentContact.id,
                            isNew: this.isNew
                        }
                    })
                );
            })
            .catch((error) => {
                this.error = error.message || 'Error saving contact';
                this.isLoading = false;
            });
    }

    handleCancel() {
        this.viewState = VIEW_STATES.LIST;
    }

    handleViewContact(event) {
        event.preventDefault();
        const contactId = event.target.dataset.id;
        this.loadContactDetails(contactId);
    }

    handleEditContact(event) {
        const contactId = event.target.dataset.id;
        this.isLoading = true;

        contactService
            .getContact(contactId)
            .then((contact) => {
                this.currentContact = contact;
                this.isNew = false;
                this.viewState = VIEW_STATES.FORM;
                this.isLoading = false;
            })
            .catch((error) => {
                this.error = error.message || 'Error loading contact for edit';
                this.isLoading = false;
            });
    }

    handleDeleteContact(event) {
        const contactId = event.target.dataset.id;
        this.itemToDeleteId = contactId;
        this.showDeleteConfirmation = true;
    }

    handleConfirmDelete() {
        this.showDeleteConfirmation = false;
        this.deleteContactRecord(this.itemToDeleteId);
        this.itemToDeleteId = null;
    }

    handleCancelDelete() {
        this.showDeleteConfirmation = false;
        this.itemToDeleteId = null;
    }

    deleteContactRecord(contactId) {
        this.isLoading = true;
        this.error = null;

        contactService
            .deleteContact(contactId)
            .then(() => {
                this.loadContacts();

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
                this.isLoading = false;
            });
    }

    handleBackToList() {
        this.viewState = VIEW_STATES.LIST;

        // Dispatch viewcontacts event
        this.dispatchEvent(new CustomEvent('viewcontacts'));
    }

    handleViewAccount(event) {
        event.preventDefault();
        const accountId = event.target.dataset.id;

        // Dispatch event to navigate to account detail
        const selectEvent = new CustomEvent('viewaccount', {
            detail: { accountId }
        });
        this.dispatchEvent(selectEvent);
    }

    // UTILITY METHODS
    validateForm() {
        // Basic validation
        if (!this.currentContact.lastName) {
            this.error = 'Last Name is required';
            return false;
        }

        if (!this.currentContact.accountId) {
            this.error = 'Account is required';
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
