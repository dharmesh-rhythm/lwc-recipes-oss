import { LightningElement, api, track } from 'lwc';
import { isOnline } from 'c/utils';

// Base URL for Salesforce REST API
const BASE_URL =
    'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/lwcossaccounts';

export default class ChecklistQuestionsTree extends LightningElement {
    @api recordId; // This will be passed from the parent component
    @track menuOpen = false;
    @track areas = [];
    @track isLoading = true;
    @track error = null;
    @track showAssessmentAreaModal = false;

    @api
    get templateId() {
        return this._templateId;
    }

    set templateId(value) {
        this._templateId = value;
        if (value) {
            this.fetchQuestionsForTemplate(value);
        }
    }

    _templateId = null;

    connectedCallback() {
        // If templateId is already available, fetch questions
        if (this._templateId) {
            this.fetchQuestionsForTemplate(this._templateId);
        }
    }

    get menuClass() {
        return this.menuOpen ? 'menu-items show' : 'menu-items';
    }

    /**
     * Fetch questions for the specified template
     */
    fetchQuestionsForTemplate(templateId) {
        this.isLoading = true;
        this.error = null;

        if (!templateId) {
            this.error = 'No template ID provided.';
            this.isLoading = false;
            return;
        }

        if (!isOnline()) {
            this.error = 'You are currently offline. Cannot fetch questions.';
            this.isLoading = false;
            return;
        }

        // Use the AssessmentControllerPoc endpoint
        const endpoint = `${BASE_URL}/?operation=getQuestions&recordId=${templateId}`;
        console.log(
            `🔄 Fetching questions for template ID: ${templateId} from ${endpoint}`
        );

        // Get a session ID from your Salesforce org
        const sessionId =
            '00D7z00000P3CKp!AQEAQOVQIkoHIawh0ULeO64_o.lnrBfzv5KGfj4.rZkOqZR7K7gRKMPoibN84yZoh19BKBjz0XgNiB04.LGcmrLc.8_1rkRU';

        const headers = {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };

        fetch(endpoint, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then((response) => {
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
            .then((data) => {
                console.log('✅ Fetched questions data:', data);

                // Handle the case where data is a stringified JSON
                let parsedData;
                try {
                    // First check if data is a string that needs parsing
                    parsedData =
                        typeof data === 'string' ? JSON.parse(data) : data;

                    // The API response should have a data property (from RestResponse wrapper)
                    if (parsedData.data) {
                        parsedData = parsedData.data;
                    } else if (parsedData.success === false) {
                        // Handle error from the server
                        throw new Error(
                            parsedData.message || 'Error from server'
                        );
                    }
                } catch (e) {
                    console.error('Error parsing API response:', e);
                    throw e;
                }

                // Process the data into our areas structure
                this.processQuestionData(parsedData);
            })
            .catch((error) => {
                console.error('❌ Error fetching questions:', error.message);
                this.error = `Failed to fetch questions: ${error.message}`;

                // Load sample data as fallback
                this.loadSampleData();
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    /**
     * Process the question data from the API
     */
    processQuestionData(data) {
        try {
            if (!Array.isArray(data)) {
                console.error('Expected array of questions, got:', data);
                throw new Error('Invalid data format');
            }

            // First, group questions by section
            const groupedBySection = data.reduce((acc, question) => {
                // Check if the section information is available
                const sectionId =
                    question.Rhythm__Section__c ||
                    question.Section__c ||
                    'unknown';
                const sectionName =
                    question.Rhythm__Section__r?.Name ||
                    question.Section__r?.Name ||
                    'Other Questions';

                if (!acc[sectionId]) {
                    acc[sectionId] = {
                        id: sectionId,
                        name: sectionName,
                        questions: []
                    };
                }

                acc[sectionId].questions.push(question);
                return acc;
            }, {});

            console.log('Questions grouped by section:', groupedBySection);

            // Convert to our area structure
            this.areas = Object.values(groupedBySection).map((section) => {
                return {
                    id: section.id,
                    name: section.name,
                    expanded: false,
                    iconPath: 'M10 7l5 5-5 5z',
                    questions: section.questions.map((q) => {
                        return {
                            id: q.Id,
                            label: q.Name || 'Question',
                            text:
                                q.Rhythm__Question__c ||
                                q.Question__c ||
                                'No question text',
                            type:
                                q.Rhythm__Question_Type__c ||
                                q.Question_Type__c ||
                                'Text',
                            sequence:
                                q.Rhythm__Sequence__c || q.Sequence__c || '',
                            expanded: false,
                            showMore: false,
                            isEditing: false,
                            iconPath: 'M10 7l5 5-5 5z',
                            subQuestions: [] // Handle sub-questions if available
                        };
                    })
                };
            });

            // Dispatch an event to notify the parent that questions are loaded
            this.dispatchEvent(
                new CustomEvent('questionsloaded', {
                    detail: {
                        templateId: this._templateId,
                        areas: this.areas
                    }
                })
            );
        } catch (error) {
            console.error('Error processing question data:', error);
            this.error = 'Error processing questions data';
            this.loadSampleData();
        }
    }

    /**
     * Load sample data as fallback
     */
    loadSampleData() {
        this.areas = [
            {
                id: 'area1',
                name: 'Sample Section',
                expanded: false,
                iconPath: 'M10 7l5 5-5 5z',
                questions: [
                    {
                        id: 'q1',
                        label: 'Question 1',
                        text: 'This is a sample question when actual data is unavailable.',
                        type: 'Text',
                        sequence: 'Q1',
                        expanded: false,
                        showMore: false,
                        isEditing: false,
                        iconPath: 'M10 7l5 5-5 5z',
                        subQuestions: []
                    },
                    {
                        id: 'q2',
                        label: 'Question 2',
                        text: 'Another sample question.',
                        type: 'Text',
                        sequence: 'Q2',
                        expanded: false,
                        showMore: false,
                        isEditing: false,
                        iconPath: 'M10 7l5 5-5 5z',
                        subQuestions: []
                    }
                ]
            }
        ];
    }

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
    }

    toggleArea(event) {
        const id = event.currentTarget.dataset.id;
        this.areas = this.areas.map((area) => {
            if (area.id === id) {
                return {
                    ...area,
                    expanded: !area.expanded,
                    iconPath: area.expanded
                        ? 'M10 7l5 5-5 5z'
                        : 'M7 10l5 5 5-5z'
                };
            }
            return area;
        });
    }

    toggleQuestion(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.map((q) => {
                    if (q.id === questionId) {
                        return {
                            ...q,
                            expanded: !q.expanded,
                            iconPath: q.expanded
                                ? 'M7 10l5 5 5-5z'
                                : 'M10 7l5 5-5 5z'
                        };
                    }
                    return q;
                });
                return { ...area, questions };
            }
            return area;
        });
    }

    toggleMore(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.map((q) => {
                    if (q.id === questionId) {
                        return { ...q, showMore: !q.showMore };
                    }
                    return q;
                });
                return { ...area, questions };
            }
            return area;
        });
    }

    startEdit(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.map((q) => {
                    if (q.id === questionId) {
                        return { ...q, isEditing: true };
                    }
                    return q;
                });
                return { ...area, questions };
            }
            return area;
        });
    }

    cancelEdit(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.map((q) => {
                    if (q.id === questionId) {
                        return { ...q, isEditing: false };
                    }
                    return q;
                });
                return { ...area, questions };
            }
            return area;
        });
    }

    saveEdit(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        const newText = event.target.value;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.map((q) => {
                    if (q.id === questionId) {
                        return { ...q, text: newText, isEditing: false };
                    }
                    return q;
                });
                return { ...area, questions };
            }
            return area;
        });
    }

    deleteQuestion(event) {
        const questionId = event.currentTarget.dataset.id;
        const areaId = event.currentTarget.dataset.areaId;
        this.areas = this.areas.map((area) => {
            if (area.id === areaId) {
                const questions = area.questions.filter(
                    (q) => q.id !== questionId
                );
                return { ...area, questions };
            }
            return area;
        });
    }

    // Computed property to check if there are no questions
    get hasNoQuestions() {
        return !this.isLoading && !this.error && this.areas.length === 0;
    }

    // Method to retry fetching questions
    retryFetch() {
        if (this._templateId) {
            this.fetchQuestionsForTemplate(this._templateId);
        } else {
            console.error('No template ID available for retry.');
        }
    }

    handleNewArea() {
        this.showAssessmentAreaModal = true;
    }
    handleCloseAssessmentAreaModal() {
        this.showAssessmentAreaModal = false;
    }
}
