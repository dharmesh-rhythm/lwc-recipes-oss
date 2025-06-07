// Mock data for contacts
const mockContacts = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        title: 'CEO',
        email: 'john.doe@globalmedia.com',
        phone: '(415) 555-1213',
        mobilePhone: '(415) 555-1214',
        accountId: '1',
        createdDate: '2023-01-12T10:30:00.000Z',
        lastModifiedDate: '2023-01-16T09:45:00.000Z'
    },
    {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        title: 'CTO',
        email: 'jane.smith@globalmedia.com',
        phone: '(415) 555-1215',
        mobilePhone: '(415) 555-1216',
        accountId: '1',
        createdDate: '2023-01-13T14:20:00.000Z',
        lastModifiedDate: '2023-01-17T16:30:00.000Z'
    },
    {
        id: '3',
        firstName: 'Robert',
        lastName: 'Johnson',
        title: 'VP of Sales',
        email: 'robert.johnson@acme.com',
        phone: '(212) 555-5556',
        mobilePhone: '(212) 555-5557',
        accountId: '2',
        createdDate: '2023-02-06T11:45:00.000Z',
        lastModifiedDate: '2023-02-11T13:20:00.000Z'
    },
    {
        id: '4',
        firstName: 'Sarah',
        lastName: 'Williams',
        title: 'VP of Marketing',
        email: 'sarah.williams@acme.com',
        phone: '(212) 555-5558',
        mobilePhone: '(212) 555-5559',
        accountId: '2',
        createdDate: '2023-02-07T10:15:00.000Z',
        lastModifiedDate: '2023-02-12T09:30:00.000Z'
    },
    {
        id: '5',
        firstName: 'Michael',
        lastName: 'Brown',
        title: 'Managing Partner',
        email: 'michael.brown@universalservices.com',
        phone: '(650) 555-3334',
        mobilePhone: '(650) 555-3335',
        accountId: '3',
        createdDate: '2023-03-16T09:00:00.000Z',
        lastModifiedDate: '2023-03-21T11:45:00.000Z'
    }
];

// In-memory store for contacts
let contacts = [...mockContacts];

// Utility function to generate unique IDs
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

// Get all contacts
export function getContacts() {
    return Promise.resolve([...contacts]);
}

// Get contact by ID
export function getContact(id) {
    const foundContact = contacts.find((cont) => cont.id === id);
    if (foundContact) {
        return Promise.resolve({ ...foundContact });
    }
    return Promise.reject(new Error(`Contact with id ${id} not found`));
}

// Get contacts by account ID
export function getContactsByAccountId(accountId) {
    const filteredContacts = contacts.filter(
        (cont) => cont.accountId === accountId
    );
    return Promise.resolve(filteredContacts.map((cont) => ({ ...cont })));
}

// Create a new contact
export function createContact(contactData) {
    const newContact = {
        ...contactData,
        id: generateId(),
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
    };
    contacts.push(newContact);
    return Promise.resolve({ ...newContact });
}

// Update an existing contact
export function updateContact(contactData) {
    const index = contacts.findIndex((cont) => cont.id === contactData.id);
    if (index !== -1) {
        const updatedContact = {
            ...contacts[index],
            ...contactData,
            lastModifiedDate: new Date().toISOString()
        };
        contacts[index] = updatedContact;
        return Promise.resolve({ ...updatedContact });
    }
    return Promise.reject(
        new Error(`Contact with id ${contactData.id} not found`)
    );
}

// Delete a contact
export function deleteContact(id) {
    const index = contacts.findIndex((cont) => cont.id === id);
    if (index !== -1) {
        contacts.splice(index, 1);
        return Promise.resolve({ success: true, id });
    }
    return Promise.reject(new Error(`Contact with id ${id} not found`));
}
