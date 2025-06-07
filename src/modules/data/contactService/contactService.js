import { contacts } from './mockData';

// In-memory storage for contacts
let _contacts = [...contacts];

/**
 * Gets all contacts
 * @returns {Promise} Promise with contacts
 */
export function getContacts() {
    return Promise.resolve(_contacts);
}

/**
 * Gets contact by Id
 * @param {String} id Contact Id
 * @returns {Promise} Promise with the contact
 */
export function getContact(id) {
    return Promise.resolve(_contacts.find((contact) => contact.id === id));
}

/**
 * Gets contacts by Account Id
 * @param {String} accountId Account Id
 * @returns {Promise} Promise with the contacts for the account
 */
export function getContactsByAccountId(accountId) {
    return Promise.resolve(
        _contacts.filter((contact) => contact.accountId === accountId)
    );
}

/**
 * Creates a new contact
 * @param {Object} contact The contact to create
 * @returns {Promise} Promise with the created contact
 */
export function createContact(contact) {
    // Create a new contact with a unique ID
    const newContact = {
        ...contact,
        id: Math.random().toString(36).substring(2, 15),
        createdDate: new Date().toISOString()
    };

    _contacts.push(newContact);
    return Promise.resolve(newContact);
}

/**
 * Updates a contact
 * @param {Object} contact The contact to update
 * @returns {Promise} Promise with the updated contact
 */
export function updateContact(contact) {
    const index = _contacts.findIndex((c) => c.id === contact.id);
    if (index === -1) {
        return Promise.reject(
            new Error(`Contact with id ${contact.id} not found`)
        );
    }

    const updatedContact = {
        ..._contacts[index],
        ...contact,
        lastModifiedDate: new Date().toISOString()
    };

    _contacts[index] = updatedContact;
    return Promise.resolve(updatedContact);
}

/**
 * Deletes a contact
 * @param {String} id Contact Id
 * @returns {Promise} Promise with the deleted contact Id
 */
export function deleteContact(id) {
    const index = _contacts.findIndex((c) => c.id === id);
    if (index === -1) {
        return Promise.reject(new Error(`Contact with id ${id} not found`));
    }

    _contacts.splice(index, 1);
    return Promise.resolve(id);
}
