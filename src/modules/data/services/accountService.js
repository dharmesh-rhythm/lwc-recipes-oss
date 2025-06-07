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

// Get all accounts
export function getAccounts() {
    return Promise.resolve([...accounts]);
}

// Get account by ID
export function getAccount(id) {
    const foundAccount = accounts.find((acc) => acc.id === id);
    if (foundAccount) {
        return Promise.resolve({ ...foundAccount });
    }
    return Promise.reject(new Error(`Account with id ${id} not found`));
}

// Create a new account
export function createAccount(accountData) {
    const newAccount = {
        ...accountData,
        id: generateId(),
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
    };
    accounts.push(newAccount);
    return Promise.resolve({ ...newAccount });
}

// Update an existing account
export function updateAccount(accountData) {
    const index = accounts.findIndex((acc) => acc.id === accountData.id);
    if (index !== -1) {
        const updatedAccount = {
            ...accounts[index],
            ...accountData,
            lastModifiedDate: new Date().toISOString()
        };
        accounts[index] = updatedAccount;
        return Promise.resolve({ ...updatedAccount });
    }
    return Promise.reject(
        new Error(`Account with id ${accountData.id} not found`)
    );
}

// Delete an account
export function deleteAccount(id) {
    const index = accounts.findIndex((acc) => acc.id === id);
    if (index !== -1) {
        accounts.splice(index, 1);
        return Promise.resolve({ success: true, id });
    }
    return Promise.reject(new Error(`Account with id ${id} not found`));
}
