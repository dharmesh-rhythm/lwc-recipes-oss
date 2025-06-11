export async function syncCREATE_CHECKLIST(data) {
    console.log('🔄 Syncing checklist to server:', data.checklistName);
    return Promise.resolve();
}

export async function syncCREATE_ASSESSMENT(data) {
    console.log('📌 Entered syncCREATE_ASSESSMENT with data:', data);

    // ✅ Client-side validation before calling API
    if (
        !data.Name ||
        !data.Rhythm__Template__c ||
        !data.Rhythm__Customer__c ||
        !data.Rhythm__Start_Date__c ||
        !data.Rhythm__End_Date__c
    ) {
        console.warn('❌ Missing required fields:', data);
        throw new Error('❌ Missing required fields in assessment data');
    }

    if (
        new Date(data.Rhythm__Start_Date__c) >
        new Date(data.Rhythm__End_Date__c)
    ) {
        throw new Error('❌ Start date must be before end date');
    }

    const sessionId =
        '00D7z00000P3CKp!AQEAQOVQIkoHIawh0ULeO64_o.lnrBfzv5KGfj4.rZkOqZR7K7gRKMPoibN84yZoh19BKBjz0XgNiB04.LGcmrLc.8_1rkRU';
    const APEX_REST_ENDPOINT_URL =
        'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/lwcossassessments/';

    const headers = {
        Authorization: `Bearer ${sessionId}`,
        'Content-Type': 'application/json'
    };

    const assessmentPayload = {
        Name: data.Name,
        Rhythm__Template__c: data.Rhythm__Template__c,
        Rhythm__Customer__c: data.Rhythm__Customer__c,
        Rhythm__Start_Date__c: data.Rhythm__Start_Date__c,
        Rhythm__End_Date__c: data.Rhythm__End_Date__c,
        Rhythm__Category__c: data.Rhythm__Category__c || '',
        Rhythm__Frequency__c: data.Rhythm__Frequency__c || '',
        Rhythm__Description__c: data.Rhythm__Description__c || ''
    };

    const requestBody = {
        operation: 'create',
        data: assessmentPayload
    };

    try {
        const response = await fetch(APEX_REST_ENDPOINT_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log(`✅ Synced assessment "${assessmentPayload.Name}"`);
            return result;
        }
    } catch (error) {
        console.error(
            `❌ Failed syncing assessment "${assessmentPayload.Name}":`,
            error.message || error
        );
        throw error;
    }
    return Promise.resolve();
}

export async function syncCREATE_FINDING(data) {
    console.log('🔄 Syncing finding:', data.description);
    return Promise.resolve();
}

export async function syncCREATE_TASK(data) {
    console.log('🔄 Syncing task:', data.title);
    return Promise.resolve();
}

export async function syncCREATE_RESPONSE(data) {
    console.log('🔄 Syncing response:', data.answer);
    return Promise.resolve();
}
window.syncHandlers = {
    syncCREATE_ASSESSMENT,
    syncCREATE_FINDING,
    syncCREATE_TASK,
    syncCREATE_RESPONSE,
    syncCREATE_CHECKLIST
};
