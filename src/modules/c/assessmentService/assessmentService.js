// Apex REST API endpoint for assessments
const APEX_REST_ENDPOINT_URL =
    'https://customization-app-1405-dev-ed.scratch.my.salesforce.com/services/apexrest/rhythm/lwcossassessments';

// Session ID for Salesforce authentication
const SESSION_ID =
    '00D7z00000P3CKp!AQEAQIMyD3k_iMTZVUWMArr.hwUFwl.DprNgTqJtGSxb.x.Qa1.5SC6CMC9ciVGG_kyN1CGymuWZGeBzjo1N0tMOwGwf5a7N';

// Get all assessments from Salesforce
export function getAssessments() {
    console.log('🌐 Getting assessments from Apex REST API');

    if (!SESSION_ID || SESSION_ID === 'YOUR_SALESFORCE_SESSION_ID') {
        console.error(
            '❌ ERROR: Session ID is not set. Please replace session ID in assessmentService.js'
        );
        return Promise.reject(
            new Error(
                'Session ID not configured. Cannot fetch from Salesforce.'
            )
        );
    }

    const headers = {
        Authorization: `Bearer ${SESSION_ID}`,
        'Content-Type': 'application/json'
    };

    return fetch(APEX_REST_ENDPOINT_URL, {
        method: 'GET',
        mode: 'cors',
        headers: headers
    })
        .then((response) => {
            console.log(
                `🌐 Received response from Apex REST API: ${response.status}`
            );
            if (response.status === 401) {
                console.error(
                    '❌ 401 Unauthorized: The Salesforce session ID is likely invalid or expired.'
                );
                throw new Error(
                    'Unauthorized: Check Salesforce session ID/access token and CORS setup.'
                );
            }
            if (!response.ok) {
                return response.text().then((text) => {
                    console.error(
                        `❌ HTTP error! status: ${response.status}, message: ${text}`
                    );
                    throw new Error(
                        `HTTP error! status: ${response.status}, message: ${text}`
                    );
                });
            }
            return response.json();
        })
        .then((fetchedData) => {
            console.log(
                `✅ Fetched ${fetchedData.assessments.length} assessments from Apex REST API`
            );

            // Transform Salesforce data to match our structure
            const transformedAssessments = fetchedData.assessments.map(
                (assessment) => ({
                    id: assessment.Id,
                    name: assessment.Name || '',
                    checklistName: assessment.Rhythm__Template__c || '',
                    startDate: assessment.Rhythm__Start_Date__c || '',
                    endDate: assessment.Rhythm__End_Date__c || '',
                    category: assessment.Rhythm__Category__c || '',
                    occurrence: assessment.Rhythm__Frequency__c || '',
                    associatedCustomer: assessment.Rhythm__Customer__c || '',
                    description: assessment.Rhythm__Description__c || '',
                    status: assessment.Rhythm__StatusFormula__c || '',
                    administrators: assessment.Rhythm__Administrators__c || '',
                    initiators: assessment.Rhythm__Initiators__c || '',
                    reviewers: assessment.Rhythm__Reviewers__c || '',
                    approvers: assessment.Rhythm__Approvers__c || '',
                    respondents: assessment.Rhythm__Respondents__c || '',
                    viewers: assessment.Rhythm__Viewers__c || '',
                    scoringRanges: assessment.Rhythm__Scoring_Ranges__c || '[]',
                    createdBy: assessment.CreatedBy?.Name || '',
                    createdDate: assessment.CreatedDate || '',
                    modifiedBy: assessment.LastModifiedBy?.Name || '',
                    lastModifiedDate: assessment.LastModifiedDate || ''
                })
            );

            return transformedAssessments;
        })
        .catch((error) => {
            console.error(
                '❌ Error fetching assessments from Apex REST API:',
                error.message
            );
            throw error;
        });
}

// Get assessment by ID
export function getAssessment(id) {
    console.log(`🌐 Getting assessment ${id} from Salesforce`);

    if (!SESSION_ID || SESSION_ID === 'YOUR_SALESFORCE_SESSION_ID') {
        console.error(
            '❌ ERROR: Session ID is not set. Please replace session ID in assessmentService.js'
        );
        return Promise.reject(
            new Error(
                'Session ID not configured. Cannot fetch from Salesforce.'
            )
        );
    }

    const headers = {
        Authorization: `Bearer ${SESSION_ID}`,
        'Content-Type': 'application/json'
    };

    // Use URL parameters to specify the operation and record ID
    const singleRecordUrl = `${APEX_REST_ENDPOINT_URL}?operation=getAssessment&recordId=${id}`;
    console.log(`🔗 Fetching from URL: ${singleRecordUrl}`);

    return fetch(singleRecordUrl, {
        method: 'GET',
        mode: 'cors',
        headers: headers
    })
        .then((response) => {
            console.log(
                `🌐 Received response for assessment ${id}: ${response.status}`
            );
            console.log(response);
            if (response.status === 401) {
                console.error(
                    '❌ 401 Unauthorized: The Salesforce session ID is likely invalid or expired.'
                );
                throw new Error(
                    'Unauthorized: Check Salesforce session ID/access token and CORS setup.'
                );
            }
            if (!response.ok) {
                return response.text().then((text) => {
                    console.error(
                        `❌ HTTP error! status: ${response.status}, message: ${text}`
                    );
                    throw new Error(
                        `HTTP error! status: ${response.status}, message: ${text}`
                    );
                });
            }
            return response.json();
        })
        .then((fetchedData) => {
            console.log(
                `✅ Fetched assessment data from Apex REST API:`,
                fetchedData
            );

            if (!fetchedData.success) {
                throw new Error(
                    fetchedData.message || 'Failed to fetch assessment'
                );
            }

            if (
                !fetchedData.assessments ||
                fetchedData.assessments.length === 0
            ) {
                throw new Error(`Assessment with id ${id} not found`);
            }

            // Transform the single assessment data
            const assessment = fetchedData.assessments[0];
            const transformedAssessment = {
                id: assessment.Id,
                name: assessment.Name || '',
                checklistName: assessment.Rhythm__Template__c || '',
                startDate: assessment.Rhythm__Start_Date__c || '',
                endDate: assessment.Rhythm__End_Date__c || '',
                category: assessment.Rhythm__Category__c || '',
                occurrence: assessment.Rhythm__Frequency__c || '',
                associatedCustomer: assessment.Rhythm__Customer__c || '',
                description: assessment.Rhythm__Description__c || '',
                status: assessment.Rhythm__StatusFormula__c || '',
                administrators: assessment.Rhythm__Administrators__c || '',
                initiators: assessment.Rhythm__Initiators__c || '',
                reviewers: assessment.Rhythm__Reviewers__c || '',
                approvers: assessment.Rhythm__Approvers__c || '',
                respondents: assessment.Rhythm__Respondents__c || '',
                viewers: assessment.Rhythm__Viewers__c || '',
                scoringRanges: assessment.Rhythm__Scoring_Ranges__c || '[]',
                createdBy: assessment.CreatedBy?.Name || '',
                createdDate: assessment.CreatedDate || '',
                modifiedBy: assessment.LastModifiedBy?.Name || '',
                lastModifiedDate: assessment.LastModifiedDate || ''
            };

            return transformedAssessment;
        })
        .catch((error) => {
            console.error(
                `❌ Error fetching assessment ${id} from Apex REST API:`,
                error.message
            );
            throw error;
        });
}

// Update an existing assessment
export function updateAssessment(assessmentData) {
    console.log(`🌐 Updating assessment ${assessmentData.id} on Salesforce`);

    const headers = {
        Authorization: `Bearer ${SESSION_ID}`,
        'Content-Type': 'application/json'
    };

    const requestBody = {
        operation: 'update',
        data: {
            Id: assessmentData.id,
            Name: assessmentData.name,
            Rhythm__Template__c: assessmentData.checklistName,
            Rhythm__Start_Date__c: assessmentData.startDate,
            Rhythm__End_Date__c: assessmentData.endDate,
            Rhythm__Category__c: assessmentData.category,
            Rhythm__Frequency__c: assessmentData.occurrence,
            Rhythm__Customer__c: assessmentData.associatedCustomer,
            Rhythm__Description__c: assessmentData.description,
            Rhythm__Administrators__c: assessmentData.administrators,
            Rhythm__Initiators__c: assessmentData.initiators,
            Rhythm__Reviewers__c: assessmentData.reviewers,
            Rhythm__Approvers__c: assessmentData.approvers,
            Rhythm__Respondents__c: assessmentData.respondents,
            Rhythm__Viewers__c: assessmentData.viewers,
            Rhythm__Scoring_Ranges__c: assessmentData.scoringRanges
        }
    };

    return fetch(APEX_REST_ENDPOINT_URL, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(requestBody)
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to update assessment: ${response.status}`
                );
            }
            return response.json();
        })
        .then(() => {
            console.log('✅ Assessment updated successfully');
            return assessmentData;
        })
        .catch((error) => {
            console.error('❌ Error updating assessment:', error.message);
            throw error;
        });
}

// Create a new assessment
export function createAssessment(assessmentData) {
    console.log('🌐 Creating assessment on Salesforce', assessmentData.name);

    const headers = {
        Authorization: `Bearer ${SESSION_ID}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
    };

    const requestBody = {
        operation: 'create',
        data: {
            Name: assessmentData.name,
            Rhythm__Template__c: assessmentData.checklistName,
            Rhythm__Start_Date__c: assessmentData.startDate,
            Rhythm__End_Date__c: assessmentData.endDate,
            Rhythm__Category__c: assessmentData.category,
            Rhythm__Frequency__c: assessmentData.occurrence,
            Rhythm__Customer__c: assessmentData.associatedCustomer,
            Rhythm__Description__c: assessmentData.description,
            Rhythm__Administrators__c: assessmentData.administrators,
            Rhythm__Initiators__c: assessmentData.initiators,
            Rhythm__Reviewers__c: assessmentData.reviewers,
            Rhythm__Approvers__c: assessmentData.approvers,
            Rhythm__Respondents__c: assessmentData.respondents,
            Rhythm__Viewers__c: assessmentData.viewers,
            Rhythm__Scoring_Ranges__c: assessmentData.scoringRanges
        }
    };

    return fetch(APEX_REST_ENDPOINT_URL, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(requestBody)
    })
        .then((response) => {
            if (response.status === 401) {
                console.error(
                    '❌ 401 Unauthorized: The Salesforce session ID is likely invalid or expired.'
                );
                throw new Error(
                    'Unauthorized: Check Salesforce session ID/access token and CORS setup.'
                );
            }
            if (!response.ok) {
                return response.text().then((text) => {
                    console.error(
                        `❌ HTTP error! status: ${response.status}, message: ${text}`
                    );
                    throw new Error(
                        `Failed to create assessment on server: ${response.status} ${text}`
                    );
                });
            }
            return response.json();
        })
        .then((createdAssessmentFromSF) => {
            console.log(
                '✅ Assessment created on server:',
                createdAssessmentFromSF
            );
            return {
                id: createdAssessmentFromSF.createdAssessment.Id,
                ...assessmentData,
                createdDate: new Date().toISOString(),
                lastModifiedDate: new Date().toISOString()
            };
        })
        .catch((error) => {
            console.error(
                '❌ Error creating assessment via Apex REST API:',
                error.message
            );
            throw error;
        });
}

// Clone an assessment
export function cloneAssessment(recordId, newName) {
    console.log(`🌐 Cloning assessment ${recordId} with new name: ${newName}`);

    const headers = {
        Authorization: `Bearer ${SESSION_ID}`,
        'Content-Type': 'application/json'
    };

    const requestBody = {
        operation: 'clone',
        data: {
            recordId: recordId,
            newName: newName
        }
    };

    return fetch(APEX_REST_ENDPOINT_URL, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        body: JSON.stringify(requestBody)
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to clone assessment: ${response.status}`
                );
            }
            return response.json();
        })
        .then((clonedData) => {
            console.log('✅ Assessment cloned on server:', clonedData);
            return clonedData.createdAssessment.Id;
        })
        .catch((error) => {
            console.error('❌ Error cloning assessment:', error.message);
            throw error;
        });
}
