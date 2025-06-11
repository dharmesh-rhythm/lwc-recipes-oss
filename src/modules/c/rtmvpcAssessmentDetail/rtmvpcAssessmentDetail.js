import { LightningElement, track } from 'lwc';

/**
 * Assessment Detail Component for LWC OSS
 * This is a UI-only version with mock data
 */
export default class RtmvpcAssessmentDetail extends LightningElement {
    // Mock data for labels
    labels = {
        timeLine: 'Time Line',
        back: 'Back',
        details: 'Details',
        SP_Follow_Up: 'Follow Up',
        emails: 'Emails',
        startDate: 'Start Date',
        SP_Flagged: 'Flagged',
        SP_Approved: 'Approved',
        SP_Rejected: 'Rejected',
        SP_All: 'All',
        SP_Non_Preferred: 'Non Preferred',
        SP_Preferred: 'Preferred',
        SP_Rep_Acc: 'Representative Account',
        SP_AssessmentFindings: 'Assessment Findings',
        // Add new metric labels
        totalCount: 'Total Count',
        completed: 'Completed',
        score: 'Score',
        followUps: 'Follow-Ups',
        findings: 'Findings',
        tasks: 'Tasks'
    };

    // Metrics data array
    metricsData = [
        {
            id: 'tech_arch',
            metrics: {
                totalCount: 10,
                completed: '75%',
                score: '85%',
                followUps: 2,
                findings: 3,
                tasks: 4
            }
        },
        {
            id: 'security',
            metrics: {
                totalCount: 8,
                completed: '60%',
                score: '90%',
                followUps: 1,
                findings: 2,
                tasks: 3
            }
        },
        {
            id: 'performance',
            metrics: {
                totalCount: 12,
                completed: '85%',
                score: '78%',
                followUps: 3,
                findings: 4,
                tasks: 2
            }
        }
    ];

    // Assessment data
    assessmentData = {
        assessmentName: 'Tech Debt',
        endDate: '(Due date May-30-2025)',
        accountAssessmentStatus: 'In Review'
    };

    // Timeline data
    assessmentTimeline = [
        {
            status: 'In Review',
            date: 'July',
            day: '29',
            time: '5:07:58\nAM',
            name: 'User User',
            id: '005XXXXXXXXXXXXXXX1',
            classlist:
                'cad-timeline_slidebase cad-timeline_customer cad-timeline_pending',
            isInReview: true,
            isSubmitted: false,
            isInProgress: false,
            isStartDate: false
        },
        {
            status: 'Submitted',
            date: 'July',
            day: '29',
            time: '5:07:09\nAM',
            name: 'User User',
            id: '005XXXXXXXXXXXXXXX2',
            classlist:
                'cad-timeline_slidebase cad-timeline_vendor cad-timeline_submited',
            isInReview: false,
            isSubmitted: true,
            isInProgress: false,
            isStartDate: false
        },
        {
            status: 'In Progress',
            date: 'July',
            day: '28',
            time: '4:43:07\nAM',
            name: 'User User',
            id: '005XXXXXXXXXXXXXXX3',
            classlist:
                'cad-timeline_slidebase cad-timeline_vendor cad-timeline_inprogress',
            isInReview: false,
            isSubmitted: false,
            isInProgress: true,
            isStartDate: false
        },
        {
            status: 'Start Date',
            date: 'July',
            day: '28',
            time: '9:07:58\nAM',
            name: 'User User',
            id: '005XXXXXXXXXXXXXXX4',
            classlist:
                'cad-timeline_slidebase cad-timeline_customer cad-timeline_default',
            isInReview: false,
            isSubmitted: false,
            isInProgress: false,
            isStartDate: true
        }
    ];

    // Assessment areas data - matches the screenshot
    // assessmentAreas = [
    //     {
    //         id: '1',
    //         title: 'Technical Architecture',
    //         question:
    //             'What are the current technical debt challenges in your system architecture?',
    //         expanded: false,
    //         response: '',
    //         responseSaved: false,
    //         responseError: false,
    //         metricsId: 'tech_arch' // Reference to metrics data
    //     },
    //     {
    //         id: '2',
    //         title: 'Security Assessment',
    //         question:
    //             'What security measures are currently implemented in your system?',
    //         expanded: false,
    //         response: '',
    //         responseSaved: false,
    //         responseError: false,
    //         metricsId: 'security' // Reference to metrics data
    //     },
    //     {
    //         id: '3',
    //         title: 'Performance Analysis',
    //         question:
    //             'What are the current performance bottlenecks in your application?',
    //         expanded: false,
    //         response: '',
    //         responseSaved: false,
    //         responseError: false,
    //         metricsId: 'performance' // Reference to metrics data
    //     }
    // ];

    @track assessmentAreas = [];

    // UI state properties
    @track viewResponse = true;
    @track isRightPanelOpen = false;
    @track showExpand = true;
    @track isTimelinePanelVisible = true;
    @track showEditIcon = true;
    @track showEditIconCustomer = true;
    @track displayHeader = 'Follow Up';
    @track showdownloadIcon = true;
    @track showFilterMenu = false;
    @track showExportMenu = false;
    @track openReviewComments = false;
    @track showCapaForm = false;
    @track openRightFile = false;
    @track openEmail = false;
    @track showModal = false;
    @track selectedItem = 'All';
    @track activeTab = 'responses';
    @track isIconDisabled = false;
    @track currentAreaId = null;
    @track showstatus = true; // Controls visibility of filter button
    @track showTasksSection = false; // New property for Tasks section visibility
    @track isEditing = false; // New property to control edit mode
    @track isFindingModalOpen = false; // Property to control new finding modal visibility
    @track isTaskModalOpen = false; // Property to control new task modal visibility
    @track isFindingCreated = false; // Property to track if a finding has been successfully created

    // Properties to store new finding form data
    @track findingName = '';
    @track findingType = '';
    @track findingDescription = '';
    @track rootCause = '';
    @track repeatFinding = '';
    @track resolutionTimeFrame = '';
    @track assessmentArea = '';
    @track status = '';
    @track uploadedFiles = []; // Property to store uploaded files for findings

    // Properties to store new task form data
    @track taskSubject = '';
    @track taskComments = '';
    @track taskDueDate = '';
    @track taskPriority = '';
    @track taskStatus = '';
    @track selectedUserId = '';
    @track taskUploadedFiles = []; // Property to store uploaded files for tasks

    // Map to track findings created per assessment area
    @track findingsCreatedMap = {};
    @track tasksCreatedMap = {};
    @track findingsPerQuestion = {};

    // Track property for current finding ID
    @track currentFindingId;

    // Add users property
    @track users = [];
    // Track comments for the chat-like interface
    @track chatMessages = [
        {
            id: 'msg1',
            sender: 'System Admin',
            content: 'Assessment started. Please review all sections.',
            timestamp: 'May-28-2025',
            position: 'left' // System Admin messages always on left
        },
        {
            id: 'msg2',
            sender: 'User',
            content:
                'This assessment needs additional details on technical debt requirements.',
            timestamp: 'May-29-2025',
            position: 'right' // User messages always on right
        }
    ];

    @track newChatMessage = '';

    // Computed property to check if not in editing mode
    get isNotEditing() {
        return !this.isEditing;
    }

    // Computed property to check if finding has been created for current area
    get hasCreatedFindingForCurrentArea() {
        return this.findingsCreatedMap[this.currentAreaId] === true;
    }

    // Computed property to check if task has been created for current area
    get hasCreatedTaskForCurrentArea() {
        return this.hasTasksForCurrentArea();
    }

    // Assessment findings data
    @track assessmentFindings = [];

    // Task data
    @track assessmentTasks = [];

    // Track save timeout
    saveTimeout;

    // Initialize assessment areas with computed metrics
    // connectedCallback() {
    //      this.getCountsData();
    //     // Add computed metrics to each area
    //     this.assessmentAreas = this.assessmentAreas.map((area) => {
    //         const metrics = this.metricsData.find(
    //             (m) => m.id === area.metricsId
    //         )?.metrics;
    //         return {
    //             ...area,
    //             get displayQuestion() {
    //                 return area.question || 'No question available';
    //             },
    //             computedMetrics: metrics || {
    //                 totalCount: 0,
    //                 completed: '0%',
    //                 score: '0%',
    //                 followUps: 0,
    //                 findings: 0,
    //                 tasks: 0
    //             }
    //         };
    //     });

    //     this.checkScreenSize();
    //     window.addEventListener('resize', this.checkScreenSize.bind(this));

    //     // Set the showstatus based on assessment status
    //     this.assessmentTimeline.forEach((res) => {
    //         if (
    //             res.status === 'In Review' ||
    //             res.status === 'Need More Information' ||
    //             res.status === 'Review Completed'
    //         ) {
    //             this.showstatus = true;
    //         }
    //     });
    // }

    connectedCallback() {
        this.getCountsData();
        this.checkScreenSize();
        //console.log("line173",Object.values(this.csection));

        window.addEventListener('resize', this.checkScreenSize.bind(this));

        // Set the showstatus based on assessment status
        this.assessmentTimeline.forEach((res) => {
            if (
                res.status === 'In Review' ||
                res.status === 'Need More Information' ||
                res.status === 'Review Completed'
            ) {
                this.showstatus = true;
            }
        });
    }

    processAssessmentAreas() {
        console.log(
            'Processing assessment areas with length:',
            this.assessmentAreas.length
        );
        const processedAreas = this.assessmentAreas.map((area) => {
            const metrics = this.metricsData.find(
                (m) => m.id === area.metricsId
            )?.metrics || {
                totalCount: area.questions?.length || 0,
                completed: '0%',
                score: '0',
                followUps: 0,
                findings: 0,
                tasks: 0
            };

            return {
                ...area,
                computedMetrics: metrics,
                get displayQuestion() {
                    return this.questions?.length
                        ? `${this.questions.length} questions in this section`
                        : 'No questions available';
                }
            };
        });

        this.assessmentAreas = processedAreas;
        console.log('Processed areas:', this.assessmentAreas);
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.checkScreenSize.bind(this));
    }

    checkScreenSize() {
        const isMobileView = window.innerWidth < 768;
        if (isMobileView) {
            this.isTimelinePanelVisible = false;
        }
    }

    // Computed properties for CSS classes
    get timelinePanelClass() {
        return this.isTimelinePanelVisible
            ? 'timeline-panel'
            : 'timeline-panel hidden';
    }

    get exportMenuClass() {
        return this.showExportMenu
            ? 'dropdown export-menu show'
            : 'dropdown export-menu';
    }

    get mockData() {
        return {
            isIconDisabled: this.isIconDisabled
        };
    }

    // Event handlers
    handleTabSwitch() {
        this.activeTab =
            this.activeTab === 'responses' ? 'reports' : 'responses';
        console.log(`Switched to tab: ${this.activeTab}`);
    }

    handleLeftButtonClick() {
        this.isTimelinePanelVisible = !this.isTimelinePanelVisible;
        // If timeline panel is being opened and right panel is open, close right panel
        if (this.isTimelinePanelVisible && this.isRightPanelOpen) {
            this.isRightPanelOpen = false;
        }
        console.log(
            'Timeline panel visibility toggled, isTimelinePanelVisible:',
            this.isTimelinePanelVisible
        );
    }

    handleRightButtonClick() {
        this.isRightPanelOpen = !this.isRightPanelOpen;
        // If right panel is being opened and timeline panel is visible, close timeline panel
        if (this.isRightPanelOpen && this.isTimelinePanelVisible) {
            this.isTimelinePanelVisible = false;
        }
        console.log(
            'Right panel visibility toggled, isRightPanelOpen:',
            this.isRightPanelOpen
        );
    }

    // Method to toggle the filter menu
    toggleFilterMenu(event) {
        // Prevent the event from propagating
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Toggle the menu visibility
        this.showFilterMenu = !this.showFilterMenu;

        // Close export menu if open
        this.showExportMenu = false;

        console.log('Filter menu toggled:', this.showFilterMenu);
    }

    // Method to close any open menus
    closeAllMenus() {
        this.showFilterMenu = false;
        this.showExportMenu = false;
    }

    toggleExportMenu(event) {
        // Stop propagation to prevent immediate closing
        if (event) {
            event.stopPropagation();
        }

        this.showExportMenu = !this.showExportMenu;
        this.showFilterMenu = false;
    }

    // We use renderedCallback instead of addEventListener
    renderedCallback() {
        if (this._hasRendered) return;
        this._hasRendered = true;

        // Add click handler to the document body directly in the component
        this.template.addEventListener('click', (event) => {
            const filterButton = this.template.querySelector('.filter-button');
            const filterMenu = this.template.querySelector('.filter-menu');
            const exportButton = this.template.querySelector('.export-button');
            const exportMenu = this.template.querySelector(
                '.' + this.exportMenuClass.split(' ')[0]
            );

            // If clicked outside filter menu and button, close the menu
            if (filterButton && filterMenu && this.showFilterMenu) {
                if (
                    !filterButton.contains(event.target) &&
                    !filterMenu.contains(event.target)
                ) {
                    this.showFilterMenu = false;
                }
            }

            // If clicked outside export menu and button, close the menu
            if (exportButton && exportMenu && this.showExportMenu) {
                if (
                    !exportButton.contains(event.target) &&
                    !exportMenu.contains(event.target)
                ) {
                    this.showExportMenu = false;
                }
            }
        });
    }

    handleAccordian(event) {
        const action = event.currentTarget.dataset.id;
        this.showExpand = !this.showExpand;
        console.log(`Accordion action: ${action}`);

        // Create a new array with all areas expanded or collapsed
        this.assessmentAreas = this.assessmentAreas.map((area) => {
            return { ...area, expanded: !this.showExpand };
        });
    }

    toggleAreaDetails(event) {
        const areaId = event.currentTarget.dataset.id;

        // Force the array to be reactive by creating a new array with the updated item
        this.assessmentAreas = this.assessmentAreas.map((area) => {
            if (area.id === areaId) {
                return { ...area, expanded: !area.expanded };
            }
            return area;
        });

        const area = this.assessmentAreas.find((a) => a.id === areaId);
        console.log(`Toggled area: ${areaId}, expanded: ${area.expanded}`);

        // Set this area as the current area for actions
        this.currentAreaId = areaId;
    }

    // Handle clicking on area title specifically
    handleAreaTitleClick(event) {
        // Prevent event from bubbling up to the area-header
        event.stopPropagation();

        // Get the area ID from the parent element's data attribute
        const areaHeader = event.currentTarget.closest('.area-header');
        if (areaHeader) {
            const areaId = areaHeader.dataset.id;

            // Force the array to be reactive by creating a new array with the updated item
            this.assessmentAreas = this.assessmentAreas.map((area) => {
                if (area.id === areaId) {
                    return { ...area, expanded: !area.expanded };
                }
                return area;
            });

            const area = this.assessmentAreas.find((a) => a.id === areaId);
            console.log(
                `Toggled area from title: ${areaId}, expanded: ${area.expanded}`
            );

            // Set this area as the current area for actions
            this.currentAreaId = areaId;
        }
    }

    handleEdit(event) {
        this.isIconDisabled = true;
        this.showEditIconCustomer = false;

        if (event.currentTarget.dataset.id === 'EditTrue') {
            this.showEditIcon = false;
            console.log('Edit mode enabled');
        } else {
            this.showEditIcon = true;
            console.log('Edit mode disabled');
        }

        // For demo purposes, we're immediately re-enabling the edit functionality
        // In a real implementation, this would be controlled by backend state
        this.isIconDisabled = false;
        this.showEditIconCustomer = true;
    }

    // Filter handlers
    handleChange(event) {
        this.selectedItem = event.currentTarget.dataset.id;
        this.showFilterMenu = false;
        console.log(`Filter changed to: ${this.selectedItem}`);
    }

    handleApproveChange(event) {
        this.selectedItem = event.currentTarget.dataset.id;
        this.showFilterMenu = false;
        console.log('Show approved items');
    }

    handleRejectChange(event) {
        this.selectedItem = event.currentTarget.dataset.id;
        this.showFilterMenu = false;
        console.log('Show rejected items');
    }

    // Action handlers
    handleSaveAction() {
        console.log('Save action triggered');
        // Add implementation for saving the assessment
        this.saveAllResponses();
    }

    handleCloseReviewAction() {
        console.log('Close review action triggered');
        // Add implementation for closing the review
    }

    // Export handlers
    handleExportPDF() {
        this.showExportMenu = false;
        console.log('Exporting as PDF');
        // Add implementation for PDF export
    }

    handleExportCSV() {
        this.showExportMenu = false;
        console.log('Exporting as CSV');
        // Add implementation for CSV export
    }

    // Modal functionality
    closeModal() {
        this.showModal = false;
    }

    // Right panel content handlers
    showComments(event) {
        this.currentAreaId = event.currentTarget.dataset.areaId;
        this.displayHeader = 'Follow-Ups';
        this.openReviewComments = true;
        this.showCapaForm = false;
        this.openRightFile = false;
        this.openEmail = false;
        this.showTasksSection = false;
        this.isRightPanelOpen = true;

        // Close timeline panel when right panel opens
        if (this.isTimelinePanelVisible) {
            this.isTimelinePanelVisible = false;
        }

        if (window.innerWidth <= 768) {
            this.showModal = true;
        }
    }

    showFindings(event) {
        this.currentAreaId = event.currentTarget.dataset.areaId;
        this.displayHeader = 'Findings';
        this.openReviewComments = false;
        this.showCapaForm = true;
        this.openRightFile = false;
        this.openEmail = false;
        this.showTasksSection = false;
        this.isRightPanelOpen = true;

        // Close timeline panel when right panel opens
        if (this.isTimelinePanelVisible) {
            this.isTimelinePanelVisible = false;
        }

        if (window.innerWidth <= 768) {
            this.showModal = true;
        }
    }

    // Method to handle the combined Findings and Tasks button
    async showFindingsAndTasks(event) {
        // Get the assessment area ID and question ID from the clicked button
        this.currentAreaId = event.currentTarget.dataset.areaId;
        const questionId = event.currentTarget.dataset.questionId;
        this.currentQuestionId = questionId; // Store current question ID

        console.log('Opening findings for:', {
            areaId: this.currentAreaId,
            questionId: this.currentQuestionId
        });

        // Set up the display
        this.displayHeader = 'Findings & Tasks';
        this.openReviewComments = false;
        this.showCapaForm = true;
        this.openRightFile = false;
        this.openEmail = false;
        this.showTasksSection = false;
        this.isRightPanelOpen = true;

        try {
            // Fetch findings for this question
            const FINDINGS_ENDPOINT =
                'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/findings/';
            const accountAssessmentRelation = 'a007z00000bz4CmAAI';

            const params = new URLSearchParams({
                operation: 'getfindings',
                accountAssessmentRelation: accountAssessmentRelation,
                questionId: questionId
            });

            console.log('Fetching findings with params:', params.toString());

            const sessionId =
                '00D7z00000P3CKp!AQEAQOVQIkoHIawh0ULeO64_o.lnrBfzv5KGfj4.rZkOqZR7K7gRKMPoibN84yZoh19BKBjz0XgNiB04.LGcmrLc.8_1rkRU';

            const headers = {
                Authorization: `Bearer ${sessionId}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(
                `${FINDINGS_ENDPOINT}?${params.toString()}`,
                {
                    method: 'GET',
                    mode: 'cors',
                    headers: headers
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rawResult = await response.json();
            // Parse the response as it's coming as a string
            const result =
                typeof rawResult === 'string'
                    ? JSON.parse(rawResult)
                    : rawResult;

            console.log('Parsed API Response:', result);

            if (result && result.success && result.data) {
                // Map the API response to our findings format
                const findingData = result.data;
                console.log('Processing finding data:', findingData);

                // Convert to array if single object
                const findings = Array.isArray(findingData)
                    ? findingData
                    : [findingData];
                console.log('Processed findings array:', findings);

                // Store findings for this question
                this.findingsPerQuestion[questionId] = findings.map(
                    (finding) => ({
                        id: finding.Id,
                        name: finding.Name || '',
                        description:
                            finding.Rhythm__Finding_Description__c || '',
                        type: finding.Rhythm__Finding_Type__c || '',
                        rootCause: finding.Rhythm__Root_Cause__c || '',
                        repeatFinding:
                            finding.Rhythm__Repeat_Finding__c || 'No',
                        resolutionTimeFrame:
                            finding.Rhythm__Resolution_Time_Frame__c || '',
                        assessmentArea:
                            finding.Rhythm__Assessment_Area__c || '',
                        status: finding.Rhythm__Status__c || '',
                        questionId: questionId,
                        areaId: this.currentAreaId
                    })
                );

                // Update assessmentFindings to show current question's findings
                this.assessmentFindings = this.findingsPerQuestion[questionId];

                // Fetch tasks for all findings in parallel
                const taskPromises = this.assessmentFindings.map((finding) => {
                    const taskParams = new URLSearchParams({
                        operation: 'getTaskRelatedToFindings',
                        recordId: finding.id // This is the WhatId for the task
                    });

                    return fetch(
                        `${FINDINGS_ENDPOINT}?${taskParams.toString()}`,
                        {
                            method: 'GET',
                            mode: 'cors',
                            headers: headers
                        }
                    )
                        .then((response1) => {
                            if (!response1.ok) {
                                throw new Error(
                                    `HTTP error! status: ${response1.status}`
                                );
                            }
                            return response1.json();
                        })
                        .then((taskResult) => {
                            const parsedTaskResult =
                                typeof taskResult === 'string'
                                    ? JSON.parse(taskResult)
                                    : taskResult;
                            return {
                                findingId: finding.id,
                                taskData: parsedTaskResult
                            };
                        })
                        .catch((error) => {
                            console.error(
                                `Error fetching tasks for finding ${finding.id}:`,
                                error
                            );
                            return {
                                findingId: finding.id,
                                error: true
                            };
                        });
                });

                // Wait for all task requests to complete
                const taskResults = await Promise.all(taskPromises);

                // Update findings with task data
                this.assessmentFindings = this.assessmentFindings.map(
                    (finding) => {
                        const taskResult = taskResults.find(
                            (result1) => result1.findingId === finding.id
                        );
                        if (
                            taskResult &&
                            !taskResult.error &&
                            taskResult.taskData &&
                            taskResult.taskData.success &&
                            taskResult.taskData.data
                        ) {
                            return {
                                ...finding,
                                relatedTask: taskResult.taskData.data,
                                hasTask: true
                            };
                        }
                        return {
                            ...finding,
                            hasTask: false
                        };
                    }
                );

                // Show findings with create task option
                this.isFindingCreated = true;
                this.findingsCreatedMap[questionId] = true;
                this.showCapaForm = true;
                this.showTasksSection = false;
            } else {
                // No findings found - show create finding option
                console.log(
                    'No findings found - showing create finding option'
                );
                this.assessmentFindings = [];
                this.isFindingCreated = false;
                this.findingsCreatedMap[questionId] = false;
                this.showCapaForm = true;
                this.showTasksSection = false;
            }
        } catch (error) {
            console.error('Error fetching findings:', error);
            this.showCustomToast('Error', 'Failed to fetch findings', 'error');
            this.assessmentFindings = [];
            this.isFindingCreated = false;
            this.findingsCreatedMap[questionId] = false;
        }

        // Close timeline panel when right panel opens
        if (this.isTimelinePanelVisible) {
            this.isTimelinePanelVisible = false;
        }

        if (window.innerWidth <= 768) {
            this.showModal = true;
        }
    }

    showTasks(event) {
        this.currentAreaId = event.currentTarget.dataset.areaId;
        this.displayHeader = 'Task Details';
        this.openReviewComments = false;
        this.showCapaForm = false;
        this.openRightFile = false;
        this.openEmail = false;
        this.showTasksSection = true;
        this.isRightPanelOpen = true;

        // Close timeline panel when right panel opens
        if (this.isTimelinePanelVisible) {
            this.isTimelinePanelVisible = false;
        }

        if (window.innerWidth <= 768) {
            this.showModal = true;
        }
    }

    showEmails(event) {
        this.currentAreaId = event.currentTarget.dataset.areaId;
        this.displayHeader = 'Emails';
        this.openReviewComments = false;
        this.showCapaForm = false;
        this.openRightFile = false;
        this.openEmail = true;
        this.showTasksSection = false;
        this.isRightPanelOpen = true;

        // Close timeline panel when right panel opens
        if (this.isTimelinePanelVisible) {
            this.isTimelinePanelVisible = false;
        }

        if (window.innerWidth <= 768) {
            this.showModal = true;
        }
    }

    // CSS class getters for menu item highlighting
    get isAllSelected() {
        return this.selectedItem === 'All' ? 'highlight-menu-item' : '';
    }

    get isLowerFlagSelected() {
        return this.selectedItem === 'showlowerflag'
            ? 'highlight-menu-item'
            : '';
    }

    get isApprovedSelected() {
        return this.selectedItem === 'showapproved'
            ? 'highlight-menu-item'
            : '';
    }

    get isRejectedSelected() {
        return this.selectedItem === 'showrejected'
            ? 'highlight-menu-item'
            : '';
    }

    // Getter for the filter menu style
    get filterMenuStyle() {
        return this.showFilterMenu ? 'display: block;' : 'display: none;';
    }

    // New getter for the filter dropdown class
    get filterDropdownClass() {
        return this.showFilterMenu
            ? 'filter-dropdown filter-dropdown-visible'
            : 'filter-dropdown';
    }

    // New methods for creating findings and tasks
    handleCreateFinding() {
        console.log(
            'Create New Finding button clicked for question:',
            this.currentQuestionId
        );
        // Add logic here to open a form or perform action to create a new finding
        this.resetFindingForm(); // Clear previous data
        this.isFindingModalOpen = true;
    }

    handleCloseFindingModal() {
        this.isFindingModalOpen = false;

        // If we manually close the modal (cancel button), we still want to check
        // if there was already a finding created and make sure UI reflects that
        if (this.findingsCreatedMap[this.currentAreaId]) {
            // Force a reactive update by recreating the findingsCreatedMap
            this.findingsCreatedMap = { ...this.findingsCreatedMap };

            // Show the tasks section if a finding was already created for this area
            this.showCapaForm = false;
            this.showTasksSection = true;
            this.isRightPanelOpen = true;

            console.log('Modal closed - Finding exists, showing tasks section');
        } else {
            // If no finding was created, keep showing the findings form
            this.showCapaForm = true;
            this.showTasksSection = false;

            console.log(
                'Modal closed - No finding yet, keeping findings form visible'
            );
        }
    }

    // Handle input changes for Finding form
    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        this[field] = value;
        console.log(`Field ${field} updated to: ${value}`);
    }

    // Helper method to get findings for current area
    get findingsForCurrentArea() {
        return this.assessmentFindings.filter(
            (finding) => finding.areaId === this.currentAreaId
        );
    }

    // Helper method to get tasks for current area
    get tasksForCurrentArea() {
        return this.assessmentTasks.filter(
            (task) => task.areaId === this.currentAreaId
        );
    }

    // Helper method to check if the current area has any findings
    hasFindingsForCurrentArea() {
        const findings = this.assessmentFindings.filter(
            (finding) => finding.areaId === this.currentAreaId
        );
        return findings && findings.length > 0;
    }

    // Helper method to check if the current area has any tasks
    hasTasksForCurrentArea() {
        const tasks = this.assessmentTasks.filter(
            (task) => task.areaId === this.currentAreaId
        );
        return tasks && tasks.length > 0;
    }

    handleSaveFinding() {
        // Validate required fields
        let allFieldsValid = true;
        const requiredFields = [
            'findingName',
            'findingType',
            'findingDescription',
            'rootCause',
            'repeatFinding',
            'resolutionTimeFrame',
            'assessmentArea',
            'status'
        ];

        requiredFields.forEach((field) => {
            if (!this[field]) {
                allFieldsValid = false;
                console.error(`Missing required field: ${field}`);
            }
        });

        if (allFieldsValid) {
            // Create a new finding object
            const newFinding = {
                id: 'finding' + Date.now(), // Generate a unique ID
                name: this.findingName,
                type: this.findingType,
                description: this.findingDescription,
                rootCause: this.rootCause,
                repeatFinding: this.repeatFinding,
                resolutionTimeFrame: this.resolutionTimeFrame,
                assessmentArea: this.assessmentArea,
                status: this.status,
                questionId: this.currentQuestionId, // Store the question ID
                areaId: this.currentAreaId // Store the assessment area ID
            };

            console.log('Saving Finding:', newFinding);

            // Close modal before updating state
            this.isFindingModalOpen = false;

            // Store the finding in findingsPerQuestion map
            if (!this.findingsPerQuestion[this.currentQuestionId]) {
                this.findingsPerQuestion[this.currentQuestionId] = [];
            }
            this.findingsPerQuestion[this.currentQuestionId].push(newFinding);

            // Update the assessmentFindings array to show current question's findings
            this.assessmentFindings =
                this.findingsPerQuestion[this.currentQuestionId];

            // Mark this question as having a finding
            this.findingsCreatedMap[this.currentQuestionId] = true;

            // Update the display header to reflect the new state
            this.displayHeader = 'Findings & Tasks';

            // Show the findings panel with create task button
            this.showCapaForm = true; // Keep showing findings section
            this.showTasksSection = false; // Don't show tasks section yet

            // Show success toast after UI has been updated
            this.showCustomToast(
                'Success',
                'Finding created successfully! You can now create a task.',
                'success'
            );
        } else {
            this.showCustomToast(
                'Error',
                'Please fill in all required fields',
                'error'
            );
        }
    }

    handleUploadButtonClick() {
        // Find the hidden file input and click it programmatically
        this.template.querySelector('.file-input').click();
    }

    handleFileUpload(event) {
        // Store the selected files
        this.uploadedFiles = event.target.files;
        console.log('Files selected:', this.uploadedFiles);
        // You might want to display the selected file names to the user
    }

    // Properties and method for custom toast
    @track isCustomToastVisible = false;
    @track customToastMessage = '';
    @track customToastVariant = ''; // 'success' or 'error'
    toastTimeout; // Property to store the timeout reference

    showCustomToast(title, message, variant) {
        this.customToastMessage = `${title}: ${message}`;
        this.customToastVariant = variant;
        this.isCustomToastVisible = true;

        // Clear any existing timeout
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        // Auto-dismiss after 3 seconds
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.toastTimeout = setTimeout(() => {
            this.closeCustomToast();
        }, 3000);
    }

    closeCustomToast() {
        this.isCustomToastVisible = false;

        // Clear the timeout when manually closing
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
            this.toastTimeout = null;
        }
    }

    // Computed properties for toast icons
    get isSuccessToast() {
        return this.customToastVariant === 'success';
    }

    get isErrorToast() {
        return this.customToastVariant === 'error';
    }

    // Computed property for toast classes
    get toastClasses() {
        let classes = 'custom-toast';
        if (this.customToastVariant === 'success') {
            classes += ' custom-toast-success';
        } else if (this.customToastVariant === 'error') {
            classes += ' custom-toast-error';
        }
        return classes;
    }

    resetFindingForm() {
        this.findingName = '';
        this.findingType = '';
        this.findingDescription = '';
        this.rootCause = '';
        this.repeatFinding = '';
        this.resolutionTimeFrame = '';
        this.assessmentArea = '';
        this.status = '';
        this.uploadedFiles = [];
    }

    handleCreateTask(event) {
        const finding = this.assessmentFindings.find(
            (f) => f.id === event.currentTarget.dataset.findingId
        );
        if (finding) {
            this.currentFindingId = finding.id;
            console.log('Creating task for finding:', {
                findingId: this.currentFindingId,
                findingName: finding.name,
                findingType: finding.type
            });

            this.resetTaskForm();
            this.isTaskModalOpen = true;
        } else {
            console.error(
                'Finding not found for ID:',
                event.currentTarget.dataset.findingId
            );
            this.showCustomToast(
                'Error',
                'Could not find the associated finding. Please try again.',
                'error'
            );
        }
    }

    handleCloseTaskModal() {
        this.isTaskModalOpen = false;
    }

    // Handle input changes for Task form
    handleTaskInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        console.log(`Changing ${field} to:`, value);
        this[field] = value;
    }

    handleTaskUploadButtonClick() {
        // Find the hidden file input for tasks and click it programmatically
        this.template.querySelector('.task-file-input').click();
    }

    handleTaskFileUpload(event) {
        // Store the selected files for tasks
        this.taskUploadedFiles = event.target.files;
        console.log('Task Files selected:', this.taskUploadedFiles);
        // You might want to display the selected file names to the user
    }

    async createTaskInSalesforce(taskPayload) {
        try {
            // Updated endpoint URL to match the @RestResource URL mapping
            const TASK_ENDPOINT =
                'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/findings/';
            const sessionId =
                '00D7z00000P3CKp!AQEAQOVQIkoHIawh0ULeO64_o.lnrBfzv5KGfj4.rZkOqZR7K7gRKMPoibN84yZoh19BKBjz0XgNiB04.LGcmrLc.8_1rkRU';

            // Modify the payload to match the Apex method's expected format
            const modifiedPayload = {
                operation: 'createTask',
                isSubmit: true,
                taskData: [taskPayload.taskData]
            };

            console.log('Sending task payload:', modifiedPayload);

            const response = await fetch(TASK_ENDPOINT, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${sessionId}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(modifiedPayload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Task creation response:', result);

            if (result) {
                // Close the modal and show success message
                this.handleCloseTaskModal();
                this.showCustomToast(
                    'Success',
                    'Task created successfully!',
                    'success'
                );

                // Reset form and update UI
                this.resetTaskForm();
                this.showCapaForm = true;
                this.showTasksSection = false;
            } else {
                throw new Error(result.message || 'Failed to create task');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            this.showCustomToast(
                'Error',
                'Failed to create task. Please try again.',
                'error'
            );
        }
    }

    handleSaveTask() {
        // Basic validation for mandatory task fields
        const mandatoryTaskFields = [
            'taskSubject',
            'taskDueDate',
            'taskPriority',
            'taskStatus',
            'selectedUserId'
        ];
        let allTaskFieldsValid = true;
        const missingFields = [];

        // Validate finding ID first
        if (!this.currentFindingId) {
            console.error('No finding ID available for task creation');
            this.showCustomToast(
                'Error',
                'No finding associated with this task. Please try again.',
                'error'
            );
            return;
        }

        mandatoryTaskFields.forEach((field) => {
            if (!this[field]) {
                allTaskFieldsValid = false;
                missingFields.push(field);
            }
        });

        if (allTaskFieldsValid) {
            try {
                // Create task payload in the format expected by Apex
                const taskPayload = {
                    operation: 'createTask',
                    accountAssessmentRelation: 'a007z00000bz4CmAAI',
                    findingId: this.currentFindingId,
                    taskData: {
                        Subject: this.taskSubject,
                        Description: this.taskComments,
                        ActivityDate: this.taskDueDate,
                        Priority: this.taskPriority,
                        Status: this.taskStatus,
                        OwnerId: this.selectedUserId,
                        WhatId: this.currentFindingId
                    }
                };

                console.log('Task Payload prepared:', {
                    ...taskPayload,
                    findingDetails: this.assessmentFindings.find(
                        (f) => f.id === this.currentFindingId
                    )
                });

                // Call the API to create task
                this.createTaskInSalesforce(taskPayload);
            } catch (error) {
                console.error('Error preparing task data:', error);
                this.showCustomToast(
                    'Error',
                    'Failed to prepare task data. Please try again.',
                    'error'
                );
            }
        } else {
            console.error('Missing required fields:', missingFields);
            this.showCustomToast(
                'Error',
                `Please fill all required fields: ${missingFields.join(', ')}`,
                'error'
            );
        }
    }

    resetTaskForm() {
        this.taskSubject = '';
        this.taskComments = '';
        this.taskDueDate = '';
        this.taskPriority = '';
        this.taskStatus = '';
        this.selectedUserId = '';
        this.taskUploadedFiles = [];
    }

    handleResponseChange(event) {
        const areaId = event.target.dataset.areaId;
        const questionId = event.target.dataset.questionId;
        const response = event.target.value;

        // Find the area and question in assessmentAreas array
        const areaIndex = this.assessmentAreas.findIndex(
            (area) => area.id === areaId
        );
        if (areaIndex !== -1) {
            const area = this.assessmentAreas[areaIndex];
            const questionIndex = area.questions.findIndex(
                (q) => q.id === questionId
            );
            if (questionIndex !== -1) {
                // Create a new array to trigger reactivity
                const newAreas = [...this.assessmentAreas];
                newAreas[areaIndex].questions[questionIndex].response =
                    response;
                newAreas[areaIndex].questions[questionIndex].responseSaved =
                    false;
                newAreas[areaIndex].questions[questionIndex].responseError =
                    false;
                this.assessmentAreas = newAreas;
            }
        }
    }

    handleSubmitResponse(event) {
        const areaId = event.target.dataset.areaId;
        const questionId = event.target.dataset.questionId;

        // Find the area and question
        const areaIndex = this.assessmentAreas.findIndex(
            (area) => area.id === areaId
        );
        if (areaIndex !== -1) {
            const area = this.assessmentAreas[areaIndex];
            const questionIndex = area.questions.findIndex(
                (q) => q.id === questionId
            );
            if (questionIndex !== -1) {
                // Save the response
                this.saveResponse(areaId, questionId).then(() => {
                    // After successful save, update completion percentage
                    this.updateAreaCompletionPercentage(areaId);
                });
            }
        }
    }

    updateAreaCompletionPercentage(areaId) {
        const areaIndex = this.assessmentAreas.findIndex(
            (area) => area.id === areaId
        );
        if (areaIndex !== -1) {
            const area = this.assessmentAreas[areaIndex];

            // Count questions with non-empty responses
            const totalQuestions = area.questions.length;
            const answeredQuestions = area.questions.filter(
                (q) => q.response && q.response.trim() !== ''
            ).length;

            // Calculate percentage
            const completionPercentage = Math.round(
                (answeredQuestions / totalQuestions) * 100
            );

            // Update the area's completion percentage
            const newAreas = [...this.assessmentAreas];
            newAreas[areaIndex].computedMetrics = {
                ...newAreas[areaIndex].computedMetrics,
                completed: `${completionPercentage}%`
            };

            this.assessmentAreas = newAreas;

            // Show success toast with completion percentage
            this.showCustomToast(
                'Success',
                `Response submitted successfully! Section is ${completionPercentage}% complete.`,
                'success'
            );
        }
    }

    async saveResponse(areaId, questionId) {
        try {
            // Here you would typically make an Apex call to save the response
            // For now, we'll simulate a successful save
            const areaIndex = this.assessmentAreas.findIndex(
                (area) => area.id === areaId
            );
            if (areaIndex !== -1) {
                const area = this.assessmentAreas[areaIndex];
                const questionIndex = area.questions.findIndex(
                    (q) => q.id === questionId
                );
                if (questionIndex !== -1) {
                    // Simulate API call
                    await this.simulateApiCall();

                    // Update the saved status
                    const newAreas = [...this.assessmentAreas];
                    newAreas[areaIndex].questions[questionIndex].responseSaved =
                        true;
                    newAreas[areaIndex].questions[questionIndex].responseError =
                        false;
                    this.assessmentAreas = newAreas;
                }
            }
        } catch (error) {
            console.error('Error saving response:', error);
            const areaIndex = this.assessmentAreas.findIndex(
                (area) => area.id === areaId
            );
            if (areaIndex !== -1) {
                const area = this.assessmentAreas[areaIndex];
                const questionIndex = area.questions.findIndex(
                    (q) => q.id === questionId
                );
                if (questionIndex !== -1) {
                    const newAreas = [...this.assessmentAreas];
                    newAreas[areaIndex].questions[questionIndex].responseSaved =
                        false;
                    newAreas[areaIndex].questions[questionIndex].responseError =
                        true;
                    this.assessmentAreas = newAreas;
                }
            }
            // Show error toast
            this.showCustomToast(
                'Error',
                'Failed to save response. Please try again.',
                'error'
            );
        }
    }

    simulateApiCall() {
        return new Promise((resolve) => {
            // Simulate a network delay
            resolve();
        });
    }

    toggleEditMode() {
        this.isEditing = !this.isEditing;
        console.log(`Edit mode toggled: ${this.isEditing}`);

        // Expand/collapse all areas based on the new editing state
        this.assessmentAreas = this.assessmentAreas.map((area) => ({
            ...area,
            expanded: this.isEditing
        }));

        // Update the expand/collapse all button state
        this.showExpand = !this.isEditing;
    }

    getCountsData() {
        const APEX_REST_ENDPOINT_URL_2 =
            'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/lwcossaccounts/?operation=getQuestions&recordId=a087z00000VgzJoAAJ';
        console.log('🌐 Online: Getting counts from Apex REST API');
        const sessionId =
            '00D7z00000P3CKp!AQEAQOVQIkoHIawh0ULeO64_o.lnrBfzv5KGfj4.rZkOqZR7K7gRKMPoibN84yZoh19BKBjz0XgNiB04.LGcmrLc.8_1rkRU';

        const headers = {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };

        const APEX_REST_ENDPOINT_URL_USER =
            'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/findings/?operation=getAllUsers';

        // Fetch users first
        fetch(APEX_REST_ENDPOINT_URL_USER, {
            method: 'GET',
            mode: 'cors',
            headers: headers
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log('Raw user data:', data);
                try {
                    const parsedData =
                        typeof data === 'string' ? JSON.parse(data) : data;
                    console.log('Parsed user data:', parsedData);

                    if (
                        parsedData &&
                        parsedData.data &&
                        Array.isArray(parsedData.data)
                    ) {
                        this.users = parsedData.data.map((user) => ({
                            id: user.Id,
                            name:
                                user.Name ||
                                `${user.FirstName || ''} ${user.LastName || ''}`.trim() ||
                                user.Username
                        }));
                    } else if (parsedData && Array.isArray(parsedData)) {
                        this.users = parsedData.map((user) => ({
                            id: user.Id,
                            name:
                                user.Name ||
                                `${user.FirstName || ''} ${user.LastName || ''}`.trim() ||
                                user.Username
                        }));
                    }
                    console.log('Processed users:', this.users);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    this.showCustomToast(
                        'Error',
                        'Failed to parse users data',
                        'error'
                    );
                }
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                this.showCustomToast(
                    'Error',
                    'Failed to fetch users list',
                    'error'
                );
            });

        // First fetch questions to get section IDs
        fetch(APEX_REST_ENDPOINT_URL_2, {
            method: 'GET',
            mode: 'cors',
            headers: headers
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
                const parsedData = JSON.parse(data).data;
                console.log('Fetched Questions:', parsedData);

                // First, group questions by section
                const groupedBySection = parsedData.reduce((acc, question) => {
                    const sectionId = question.Rhythm__Section__c;
                    if (!acc[sectionId]) {
                        acc[sectionId] = {
                            sectionId: sectionId,
                            sectionName: question.Rhythm__Section__r.Name,
                            questions: []
                        };
                    }
                    acc[sectionId].questions.push(question);
                    return acc;
                }, {});

                // Get unique section IDs
                const sectionIds = Object.keys(groupedBySection);
                console.log('secid', sectionIds);

                // Create promises for fetching metrics for each section
                const metricPromises = sectionIds.flatMap((sectionId) => {
                    const baseUrl =
                        'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/lwcossaccounts/?operation=getCounts';
                    const accountAssRelId = 'a007z00000bz4CmAAI';

                    return [
                        // Followups
                        fetch(
                            `${baseUrl}&sectionId=${sectionId}&accountAssRelId=${accountAssRelId}&type=comments`,
                            {
                                method: 'GET',
                                mode: 'cors',
                                headers: headers
                            }
                        ).then((res) => res.json()),
                        // Findings
                        fetch(
                            `${baseUrl}&sectionId=${sectionId}&accountAssRelId=${accountAssRelId}&type=findings`,
                            {
                                method: 'GET',
                                mode: 'cors',
                                headers: headers
                            }
                        ).then((res) => res.json()),
                        // Tasks
                        fetch(
                            `${baseUrl}&sectionId=${sectionId}&accountAssRelId=${accountAssRelId}&type=tasks`,
                            {
                                method: 'GET',
                                mode: 'cors',
                                headers: headers
                            }
                        ).then((res) => res.json())
                    ];
                });

                // Wait for all metric requests to complete
                Promise.all(metricPromises)
                    .then((results) => {
                        // Process results in groups of 3 (followups, findings, tasks for each section)
                        const sectionMetrics = {};
                        console.log('res', results);

                        for (let i = 0; i < results.length; i += 3) {
                            const sectionId = sectionIds[Math.floor(i / 3)];

                            // Parse each response and safely extract count
                            const parseMetricData = (result) => {
                                try {
                                    const parsed = JSON.parse(result);
                                    if (
                                        parsed.success &&
                                        parsed.data &&
                                        parsed.data.length > 0
                                    ) {
                                        return parsed.data[0].count || 0;
                                    }
                                    return 0;
                                } catch (e) {
                                    console.error(
                                        'Error parsing metric data:',
                                        e
                                    );
                                    return 0;
                                }
                            };

                            const followups = parseMetricData(results[i]);
                            const findings = parseMetricData(results[i + 1]);
                            const tasks = parseMetricData(results[i + 2]);

                            sectionMetrics[sectionId] = {
                                followUps: followups,
                                findings: findings,
                                tasks: tasks
                            };

                            console.log(
                                `Metrics for section ${sectionId}:`,
                                sectionMetrics[sectionId]
                            );
                        }

                        // Map the grouped data to our assessment areas structure with metrics
                        const mappedAreas = Object.values(groupedBySection).map(
                            (section, sectionIndex) => {
                                const metrics = sectionMetrics[
                                    section.sectionId
                                ] || { followUps: 0, findings: 0, tasks: 0 };
                                return {
                                    id: section.sectionId,
                                    title: section.sectionName,
                                    expanded: false,
                                    questions: section.questions.map(
                                        (question, questionIndex) => ({
                                            id: question.Id,
                                            Rhythm__Question_Type__c:
                                                question.Rhythm__Question_Type__c,
                                            question:
                                                question.Rhythm__Question__c,
                                            response: '',
                                            responseSaved: false,
                                            responseError: false,
                                            metricsId: `section_${sectionIndex}_question_${questionIndex}`
                                        })
                                    ),
                                    computedMetrics: {
                                        totalCount: section.questions.length,
                                        completed: '0%',
                                        score: '0',
                                        followUps: metrics.followUps,
                                        findings: metrics.findings,
                                        tasks: metrics.tasks
                                    },
                                    metricsId: `section_${sectionIndex}`
                                };
                            }
                        );

                        // Update the assessmentAreas property
                        this.assessmentAreas = mappedAreas;
                        console.log(
                            'Assessment areas updated with metrics:',
                            mappedAreas
                        );
                    })
                    .catch((error) => {
                        console.error('Error fetching metrics:', error);
                    });
            })
            .catch((error) => {
                console.error('❌ Error fetching counts:', error.message);
                throw error;
            });
    }

    // New method to save all responses
    async saveAllResponses() {
        try {
            const responsesToSave = [];
            let totalQuestions = 0;
            let answeredQuestions = 0;

            // Iterate through all sections and their questions
            this.assessmentAreas.forEach((area) => {
                area.questions.forEach((question) => {
                    totalQuestions++;
                    if (question.response && question.response.trim() !== '') {
                        answeredQuestions++;
                        responsesToSave.push({
                            areaId: area.id,
                            questionId: question.id,
                            response: question.response
                        });
                    }
                });
            });

            // Calculate overall completion percentage
            const overallCompletionPercentage = Math.round(
                (answeredQuestions / totalQuestions) * 100
            );

            // Simulate saving responses
            await this.simulateApiCall();

            // Update UI with saved statuses and completion percentages
            const newAreas = [...this.assessmentAreas];
            newAreas.forEach((area) => {
                area.questions.forEach((question) => {
                    const savedResponse = responsesToSave.find(
                        (r) => r.questionId === question.id
                    );
                    if (savedResponse) {
                        question.responseSaved = true;
                        question.responseError = false;
                    } else {
                        question.responseSaved = false;
                        question.responseError = true;
                    }
                });

                // Update section completion percentage
                const sectionTotalQuestions = area.questions.length;
                const sectionAnsweredQuestions = area.questions.filter(
                    (q) => q.response && q.response.trim() !== ''
                ).length;
                const sectionCompletionPercentage = Math.round(
                    (sectionAnsweredQuestions / sectionTotalQuestions) * 100
                );
                area.computedMetrics = {
                    ...area.computedMetrics,
                    completed: `${sectionCompletionPercentage}%`
                };
            });
            this.assessmentAreas = newAreas;

            // Show success toast with overall completion percentage
            this.showCustomToast(
                'Success',
                `All responses saved successfully! Overall completion: ${overallCompletionPercentage}%`,
                'success'
            );
        } catch (error) {
            console.error('Error saving responses:', error);
            this.showCustomToast(
                'Error',
                'Failed to save responses. Please try again.',
                'error'
            );
        }
    }

    // Getter to check if findings exist for current question
    get hasFindingsForCurrentQuestion() {
        const hasFindings =
            this.currentQuestionId &&
            this.findingsPerQuestion[this.currentQuestionId] &&
            this.findingsPerQuestion[this.currentQuestionId].length > 0;
        console.log('hasFindingsForCurrentQuestion check:', {
            currentQuestionId: this.currentQuestionId,
            findingsForQuestion:
                this.findingsPerQuestion[this.currentQuestionId],
            hasFindings: hasFindings
        });
        return hasFindings;
    }

    // Add a getter for users
    get assignedToOptions() {
        console.log('Current users in getter:', this.users);
        return [{ id: '', name: '-- Select User --' }, ...this.users];
    }

    // Handle input change for chat message
    handleChatInputChange(event) {
        this.newChatMessage = event.target.value;
    }

    // Send new chat message
    handleSendChatMessage() {
        if (!this.newChatMessage.trim()) return;

        // Create a new message
        const position = this.getNextMessagePosition();
        const sender = position === 'left' ? 'System Admin' : 'User';

        const newMessage = {
            id: 'msg' + Date.now(),
            sender: sender, // Set sender based on position
            content: this.newChatMessage,
            timestamp: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            position: position // Alternating positions
        };

        // Add to chat messages
        this.chatMessages = [...this.chatMessages, newMessage];

        // Clear input
        this.newChatMessage = '';

        // Show success toast
        // this.showCustomToast('Success', 'Message sent', 'success');
    }

    // Helper method to determine next message position
    getNextMessagePosition() {
        const length = this.chatMessages.length;
        if (length % 2 === 0) {
            return 'left';
        }
        return 'right';
    }

    // Handle Enter key press in chat input
    handleChatKeyPress(event) {
        if (event.key === 'Enter') {
            this.handleSendChatMessage();
        }
    }

    // Compute full class for chat message based on position
    getChatMessageClass(message) {
        if (message.position === 'left') {
            return 'chat-message chat-message-left';
        }
        return 'chat-message chat-message-right';
    }

    // Computed property for the chat messages with proper classes
    get chatMessagesWithClasses() {
        return this.chatMessages.map((message) => {
            return {
                ...message,
                cssClass: this.getChatMessageClass(message)
            };
        });
    }

    // Tab-related getters
    get responsesTabClass() {
        if (this.activeTab === 'responses') {
            return 'tab active';
        }
        return 'tab';
    }

    get reportsTabClass() {
        if (this.activeTab === 'reports') {
            return 'tab active';
        }
        return 'tab';
    }

    get isResponsesTabActive() {
        return this.activeTab === 'responses';
    }

    get isReportsTabActive() {
        return this.activeTab === 'reports';
    }
}
