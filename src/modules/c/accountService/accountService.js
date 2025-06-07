import * as utils from 'c/utils';
import { isOnline } from 'c/utils';

// Mock data for accounts
const mockAccounts = [
    {
        id: '1',
        name: 'Global Media',
        industry: 'Media',
        type: 'Customer - Direct',
        website: 'https://globalmedia.com',
        phone: '(415) 555-1212',
        description: 'Global Media is a leading media company.',
        createdDate: '2023-01-10T08:30:00.000Z',
        lastModifiedDate: '2023-01-15T14:20:00.000Z'
    },
    {
        id: '2',
        name: 'Acme Corporation',
        industry: 'Manufacturing',
        type: 'Customer - Channel',
        website: 'https://acme.com',
        phone: '(212) 555-5555',
        description: 'Acme Corporation manufactures everything.',
        createdDate: '2023-02-05T09:45:00.000Z',
        lastModifiedDate: '2023-02-10T16:30:00.000Z'
    },
    {
        id: '3',
        name: 'Universal Services',
        industry: 'Consulting',
        type: 'Customer - Direct',
        website: 'https://universalservices.com',
        phone: '(650) 555-3333',
        description:
            'Universal Services provides consulting services worldwide.',
        createdDate: '2023-03-15T11:20:00.000Z',
        lastModifiedDate: '2023-03-20T13:10:00.000Z'
    }
];

// In-memory store for accounts
let accounts = [...mockAccounts];

// Utility function to generate unique IDs
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

// Initialize the local storage with mock data if empty
export function initializeOfflineStorage() {
    console.log('🔄 Initializing account offline storage...');
    return utils.getAll(utils.STORE_NAMES.ACCOUNTS).then((storedAccounts) => {
        if (!storedAccounts || storedAccounts.length === 0) {
            console.log(
                '💾 No accounts found in offline storage. Adding mock data...'
            );
            return utils
                .saveItems(utils.STORE_NAMES.ACCOUNTS, mockAccounts)
                .then((result) => {
                    console.log(
                        `✅ Added ${result.length} mock accounts to offline storage`
                    );
                    return result;
                });
        }
        console.log(
            `✅ Found ${storedAccounts.length} accounts in offline storage`
        );
        return storedAccounts;
    });
}

// Get all accounts
export function getAccounts() {
    if (isOnline()) {
        console.log('🌐 Online: Getting accounts from server');
        // Online: get from server and update local storage
        return Promise.resolve([...accounts]).then((result) => {
            console.log(
                `💾 Saving ${result.length} accounts to offline storage`
            );
            utils.saveItems(utils.STORE_NAMES.ACCOUNTS, result);
            return result;
        });
    }

    console.log('📴 Offline: Getting accounts from local storage');
    // Offline: get from local storage
    return utils
        .getAll(utils.STORE_NAMES.ACCOUNTS)
        .then((accountsFromStorage) => {
            console.log(
                `📋 Retrieved ${accountsFromStorage.length} accounts from offline storage`
            );
            return accountsFromStorage;
        });
}

// Get account by ID
export function getAccount(id) {
    if (isOnline()) {
        console.log(`🌐 Online: Getting account ${id} from server`);
        // Online: get from server
        const foundAccount = accounts.find((acc) => acc.id === id);
        if (foundAccount) {
            return Promise.resolve({ ...foundAccount });
        }
        return Promise.reject(new Error(`Account with id ${id} not found`));
    }

    console.log(`📴 Offline: Getting account ${id} from local storage`);
    // Offline: get from local storage
    return utils.getById(utils.STORE_NAMES.ACCOUNTS, id).then((account) => {
        console.log('📋 Retrieved account from offline storage:', account.name);
        return account;
    });
}

// Create a new account
export function createAccount(accountData) {
    const newAccount = {
        ...accountData,
        id: generateId(),
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
    };

    if (isOnline()) {
        console.log('🌐 Online: Creating account on server', newAccount.name);
        // Online: create on server and update local storage
        accounts.push(newAccount);
        return Promise.resolve({ ...newAccount }).then((result) => {
            console.log('💾 Saving new account to offline storage');
            utils.saveItem(utils.STORE_NAMES.ACCOUNTS, result);
            return result;
        });
    }

    console.log(
        '📴 Offline: Creating account in local storage',
        newAccount.name
    );
    // Offline: save to local storage and queue for sync
    return utils
        .saveItem(utils.STORE_NAMES.ACCOUNTS, newAccount)
        .then((result) => {
            console.log('💾 Account saved to offline storage');
            // Add to pending operations queue
            console.log('📝 Adding CREATE operation to pending queue');
            return utils
                .addPendingOperation({
                    type: 'CREATE_ACCOUNT',
                    data: result
                })
                .then(() => {
                    console.log(
                        '✅ Account created locally and queued for sync'
                    );
                    return result;
                });
        });
}

// Update an existing account
export function updateAccount(accountData) {
    if (isOnline()) {
        console.log(`🌐 Online: Updating account ${accountData.id} on server`);
        // Online: update on server
        const index = accounts.findIndex((acc) => acc.id === accountData.id);
        if (index !== -1) {
            const updatedAccount = {
                ...accounts[index],
                ...accountData,
                lastModifiedDate: new Date().toISOString()
            };
            accounts[index] = updatedAccount;

            // Also update in local storage
            return Promise.resolve({ ...updatedAccount }).then((result) => {
                console.log('💾 Saving updated account to offline storage');
                utils.saveItem(utils.STORE_NAMES.ACCOUNTS, result);
                return result;
            });
        }
        return Promise.reject(
            new Error(`Account with id ${accountData.id} not found`)
        );
    }

    console.log(
        `📴 Offline: Updating account ${accountData.id} in local storage`
    );
    // Offline: update in local storage and queue for sync
    return utils
        .getById(utils.STORE_NAMES.ACCOUNTS, accountData.id)
        .then((existingAccount) => {
            const updatedAccount = {
                ...existingAccount,
                ...accountData,
                lastModifiedDate: new Date().toISOString()
            };

            console.log('💾 Saving updated account to offline storage');
            return utils
                .saveItem(utils.STORE_NAMES.ACCOUNTS, updatedAccount)
                .then((result) => {
                    // Add to pending operations queue
                    console.log('📝 Adding UPDATE operation to pending queue');
                    return utils
                        .addPendingOperation({
                            type: 'UPDATE_ACCOUNT',
                            data: result
                        })
                        .then(() => {
                            console.log(
                                '✅ Account updated locally and queued for sync'
                            );
                            return result;
                        });
                });
        });
}

// Delete an account
export function deleteAccount(id) {
    if (isOnline()) {
        console.log(`🌐 Online: Deleting account ${id} from server`);
        // Online: delete from server
        const index = accounts.findIndex((acc) => acc.id === id);
        if (index !== -1) {
            accounts.splice(index, 1);

            // Also delete from local storage
            return Promise.resolve({ success: true, id }).then((result) => {
                console.log('💾 Removing account from offline storage');
                utils.deleteItem(utils.STORE_NAMES.ACCOUNTS, id);
                return result;
            });
        }
        return Promise.reject(new Error(`Account with id ${id} not found`));
    }

    console.log(
        `📴 Offline: Marking account ${id} for deletion in local storage`
    );
    // Offline: mark as deleted in local storage and queue for sync
    return utils.getById(utils.STORE_NAMES.ACCOUNTS, id).then(() => {
        console.log('📝 Adding DELETE operation to pending queue');
        // Add to pending operations queue for later deletion
        return utils
            .addPendingOperation({
                type: 'DELETE_ACCOUNT',
                data: { id }
            })
            .then(() => {
                console.log('💾 Removing account from offline storage');
                // Remove from local storage
                return utils
                    .deleteItem(utils.STORE_NAMES.ACCOUNTS, id)
                    .then(() => {
                        console.log(
                            '✅ Account deleted locally and queued for sync'
                        );
                        return { success: true, id };
                    });
            });
    });
}

// Sync pending operations when online
export function syncPendingOperations() {
    if (!isOnline()) {
        console.log('❌ Cannot sync while offline');
        return Promise.reject(new Error('Cannot sync while offline'));
    }

    console.log('🔄 Syncing pending account operations');
    return utils.getPendingOperations().then((operations) => {
        // Filter account operations
        const accountOps = operations.filter((op) =>
            ['CREATE_ACCOUNT', 'UPDATE_ACCOUNT', 'DELETE_ACCOUNT'].includes(
                op.type
            )
        );

        if (!accountOps || accountOps.length === 0) {
            console.log('✅ No pending account operations to sync');
            return { synced: 0, total: 0 };
        }

        console.log(`🔄 Found ${accountOps.length} pending account operations`);

        // Sort operations by timestamp
        const sortedOps = [...accountOps].sort(
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
                        case 'CREATE_ACCOUNT':
                            // For create operations, we need to check if it was already created
                            processPromise = new Promise((resolve) => {
                                // Check if account already exists with this ID
                                const existingAccount = accounts.find(
                                    (acc) => acc.id === operation.data.id
                                );
                                if (existingAccount) {
                                    console.log(
                                        `⚠️ Account already exists, treating as successful sync`
                                    );
                                    resolve(existingAccount);
                                } else {
                                    // Create account on server
                                    const createData = { ...operation.data };
                                    resolve(createAccount(createData));
                                }
                            });
                            break;

                        case 'UPDATE_ACCOUNT':
                            // Update account on server
                            processPromise = updateAccount(operation.data);
                            break;

                        case 'DELETE_ACCOUNT':
                            // Delete account on server
                            processPromise = deleteAccount(operation.data.id);
                            break;

                        default:
                            processPromise = Promise.resolve();
                    }

                    // Mark operation as being processed
                    operation.processing = true;

                    // Remove the operation from queue after processing
                    return processPromise
                        .then(() => {
                            console.log(
                                `✅ Successfully processed ${operation.type} for id: ${operation.data?.id || 'new'}`
                            );
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
            { synced: 0, errors: 0, total: accountOps.length }
        );
    });
}
