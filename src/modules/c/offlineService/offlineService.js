import { generateId, saveItem, addPendingOperation } from 'c/utils';

/**
 * Save data locally and queue for syncing
 */
export async function saveOfflineAndQueue(storeName, operationType, data) {
    const record = {
        id:
            data && typeof data.id === 'string' && data.id.trim()
                ? data.id
                : generateId(),
        ...data,

        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
    };

    await saveItem(storeName, record);
    await addPendingOperation({
        id: generateId(),
        type: operationType,
        timestamp: Date.now(),
        data: record
    });

    console.log(`✅ Queued ${operationType} to sync`);
    return record;
}
