import * as utils from 'c/utils';
import { isOnline } from 'c/utils';

// Mock data for contacts
const mockContacts = [
    {
        id: '1',
        accountId: '1',
        firstName: 'John',
        lastName: 'Smith',
        title: 'CEO',
        email: 'john.smith@globalmedia.com',
        phone: '(415) 555-1234',
        department: 'Executive',
        createdDate: '2023-01-12T10:30:00.000Z',
        lastModifiedDate: '2023-01-16T09:15:00.000Z'
    },
    {
        id: '2',
        accountId: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        title: 'CTO',
        email: 'sarah.johnson@globalmedia.com',
        phone: '(415) 555-5678',
        department: 'Technology',
        createdDate: '2023-01-14T11:20:00.000Z',
        lastModifiedDate: '2023-01-18T14:30:00.000Z'
    },
    {
        id: '3',
        accountId: '2',
        firstName: 'Mike',
        lastName: 'Wilson',
        title: 'VP Sales',
        email: 'mike.wilson@acme.com',
        phone: '(212) 555-7890',
        department: 'Sales',
        createdDate: '2023-02-07T13:45:00.000Z',
        lastModifiedDate: '2023-02-12T16:20:00.000Z'
    },
    {
        id: '4',
        accountId: '3',
        firstName: 'Lisa',
        lastName: 'Brown',
        title: 'Director',
        email: 'lisa.brown@universalservices.com',
        phone: '(650) 555-4321',
        department: 'Consulting',
        createdDate: '2023-03-18T10:10:00.000Z',
        lastModifiedDate: '2023-03-22T11:30:00.000Z'
    }
];

// In-memory store for contacts
let contacts = [...mockContacts];

// Utility function to generate unique IDs
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

// Initialize the local storage with mock data if empty
export function initializeOfflineStorage() {
    return utils.getAll(utils.STORE_NAMES.CONTACTS).then((storedContacts) => {
        if (!storedContacts || storedContacts.length === 0) {
            return utils.saveItems(utils.STORE_NAMES.CONTACTS, mockContacts);
        }
        return storedContacts;
    });
}

// Get all contacts
export function getContacts() {
    if (isOnline()) {
        // Online: get from server and update local storage
        return Promise.resolve([...contacts]).then((result) => {
            utils.saveItems(utils.STORE_NAMES.CONTACTS, result);
            return result;
        });
    }

    // Offline: get from local storage
    return utils.getAll(utils.STORE_NAMES.CONTACTS);
}

// Get contact by ID
export function getContact(id) {
    if (isOnline()) {
        // Online: get from server
        const foundContact = contacts.find((contact) => contact.id === id);
        if (foundContact) {
            return Promise.resolve({ ...foundContact });
        }
        return Promise.reject(new Error(`Contact with id ${id} not found`));
    }

    // Offline: get from local storage
    return utils.getById(utils.STORE_NAMES.CONTACTS, id);
}

// Get contacts by Account ID
export function getContactsByAccountId(accountId) {
    if (isOnline()) {
        // Online: get from server
        const filteredContacts = contacts.filter(
            (contact) => contact.accountId === accountId
        );
        return Promise.resolve([...filteredContacts]);
    }

    // Offline: get from local storage and filter
    return utils.getAll(utils.STORE_NAMES.CONTACTS).then((allContacts) => {
        return allContacts.filter((contact) => contact.accountId === accountId);
    });
}

// Create a new contact
export function createContact(contactData) {
    const newContact = {
        ...contactData,
        id: generateId(),
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
    };

    if (isOnline()) {
        // Online: create on server and update local storage
        contacts.push(newContact);
        return Promise.resolve({ ...newContact }).then((result) => {
            utils.saveItem(utils.STORE_NAMES.CONTACTS, result);
            return result;
        });
    }

    // Offline: save to local storage and queue for sync
    return utils
        .saveItem(utils.STORE_NAMES.CONTACTS, newContact)
        .then((result) => {
            // Add to pending operations queue
            return utils
                .addPendingOperation({
                    type: 'CREATE_CONTACT',
                    data: result
                })
                .then(() => result);
        });
}

// Update an existing contact
export function updateContact(contactData) {
    if (isOnline()) {
        // Online: update on server
        const index = contacts.findIndex(
            (contact) => contact.id === contactData.id
        );
        if (index !== -1) {
            const updatedContact = {
                ...contacts[index],
                ...contactData,
                lastModifiedDate: new Date().toISOString()
            };
            contacts[index] = updatedContact;

            // Also update in local storage
            return Promise.resolve({ ...updatedContact }).then((result) => {
                utils.saveItem(utils.STORE_NAMES.CONTACTS, result);
                return result;
            });
        }
        return Promise.reject(
            new Error(`Contact with id ${contactData.id} not found`)
        );
    }

    // Offline: update in local storage and queue for sync
    return utils
        .getById(utils.STORE_NAMES.CONTACTS, contactData.id)
        .then((existingContact) => {
            const updatedContact = {
                ...existingContact,
                ...contactData,
                lastModifiedDate: new Date().toISOString()
            };

            return utils
                .saveItem(utils.STORE_NAMES.CONTACTS, updatedContact)
                .then((result) => {
                    // Add to pending operations queue
                    return utils
                        .addPendingOperation({
                            type: 'UPDATE_CONTACT',
                            data: result
                        })
                        .then(() => result);
                });
        });
}

// Delete a contact
export function deleteContact(id) {
    if (isOnline()) {
        // Online: delete from server
        const index = contacts.findIndex((contact) => contact.id === id);
        if (index !== -1) {
            contacts.splice(index, 1);

            // Also delete from local storage
            return Promise.resolve({ success: true, id }).then((result) => {
                utils.deleteItem(utils.STORE_NAMES.CONTACTS, id);
                return result;
            });
        }
        return Promise.reject(new Error(`Contact with id ${id} not found`));
    }

    // Offline: mark as deleted in local storage and queue for sync
    return utils.getById(utils.STORE_NAMES.CONTACTS, id).then(() => {
        // Add to pending operations queue for later deletion
        return utils
            .addPendingOperation({
                type: 'DELETE_CONTACT',
                data: { id }
            })
            .then(() => {
                // Remove from local storage
                return utils.deleteItem(utils.STORE_NAMES.CONTACTS, id);
            });
    });
}

// Sync pending contact operations when online
export function syncPendingOperations() {
    if (!isOnline()) {
        console.log('❌ Cannot sync while offline');
        return Promise.reject(new Error('Cannot sync while offline'));
    }

    console.log('🔄 Syncing pending contact operations');
    return utils.getPendingOperations().then((operations) => {
        // Filter contact operations
        const contactOps = operations.filter((op) =>
            ['CREATE_CONTACT', 'UPDATE_CONTACT', 'DELETE_CONTACT'].includes(
                op.type
            )
        );

        if (!contactOps || contactOps.length === 0) {
            console.log('✅ No pending contact operations to sync');
            return { synced: 0, total: 0 };
        }

        console.log(`🔄 Found ${contactOps.length} pending contact operations`);

        // Sort operations by timestamp
        const sortedOps = [...contactOps].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Process each operation in sequence
        return sortedOps.reduce(
            (promise, operation) => {
                return promise.then((result) => {
                    // Skip already processed operations
                    if (operation.processed) {
                        console.log(
                            `⏭️ Skipping already processed operation ${operation.id}`
                        );
                        return result;
                    }

                    // Process the operation based on type
                    let processPromise;
                    console.log(
                        `🔄 Processing ${operation.type} operation for id: ${operation.data?.id || 'new'}`
                    );

                    switch (operation.type) {
                        case 'CREATE_CONTACT':
                            // For create operations, we need to check if it was already created
                            processPromise = new Promise((resolve) => {
                                // Check if contact already exists with this ID
                                const existingContact = contacts.find(
                                    (c) => c.id === operation.data.id
                                );
                                if (existingContact) {
                                    console.log(
                                        `⚠️ Contact already exists, treating as successful sync`
                                    );
                                    resolve(existingContact);
                                } else {
                                    // Create contact on server
                                    const createData = { ...operation.data };
                                    resolve(createContact(createData));
                                }
                            });
                            break;

                        case 'UPDATE_CONTACT':
                            // Update contact on server
                            processPromise = updateContact(operation.data);
                            break;

                        case 'DELETE_CONTACT':
                            // Delete contact on server
                            processPromise = deleteContact(operation.data.id);
                            break;

                        default:
                            processPromise = Promise.resolve();
                    }

                    // Mark operation as being processed
                    operation.processing = true;

                    return processPromise
                        .then(() => {
                            console.log(
                                `✅ Successfully processed ${operation.type} for id: ${operation.data?.id || 'new'}`
                            );
                            // Remove from pending operations
                            return utils.deletePendingOperation(operation.id);
                        })
                        .then(() => {
                            // Update counts for result
                            result.synced += 1;
                            return result;
                        })
                        .catch((error) => {
                            console.error(
                                `❌ Error processing ${operation.type}:`,
                                error.message || error
                            );

                            // Increment error count but continue with next operation
                            result.errors = (result.errors || 0) + 1;
                            return result;
                        });
                });
            },
            { synced: 0, errors: 0, total: contactOps.length }
        );
    });
}
