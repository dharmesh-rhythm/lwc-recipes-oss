import { accounts } from './mockData';

// In-memory storage for accounts
let _accounts = [...accounts];

/**
 * Gets all accounts
 * @returns {Promise} Promise with accounts
 */
export function getAccounts() {
    return Promise.resolve(_accounts);
}

/**
 * Gets account by Id
 * @param {String} id Account Id
 * @returns {Promise} Promise with the account
 */
export function getAccount(id) {
    return Promise.resolve(_accounts.find((account) => account.id === id));
}

/**
 * Creates a new account
 * @param {Object} account The account to create
 * @returns {Promise} Promise with the created account
 */
export function createAccount(account) {
    // Create a new account with a unique ID
    const newAccount = {
        ...account,
        id: Math.random().toString(36).substring(2, 15),
        createdDate: new Date().toISOString()
    };

    _accounts.push(newAccount);
    return Promise.resolve(newAccount);
}

/**
 * Updates an account
 * @param {Object} account The account to update
 * @returns {Promise} Promise with the updated account
 */
export function updateAccount(account) {
    const index = _accounts.findIndex((a) => a.id === account.id);
    if (index === -1) {
        return Promise.reject(
            new Error(`Account with id ${account.id} not found`)
        );
    }

    const updatedAccount = {
        ..._accounts[index],
        ...account,
        lastModifiedDate: new Date().toISOString()
    };

    _accounts[index] = updatedAccount;
    return Promise.resolve(updatedAccount);
}

/**
 * Deletes an account
 * @param {String} id Account Id
 * @returns {Promise} Promise with the deleted account Id
 */
export function deleteAccount(id) {
    const index = _accounts.findIndex((a) => a.id === id);
    if (index === -1) {
        return Promise.reject(new Error(`Account with id ${id} not found`));
    }

    _accounts.splice(index, 1);
    return Promise.resolve(id);
}
