import { LightningElement, api, track } from 'lwc';
import {
    getAssessments,
    getAssessment,
    updateAssessment
} from 'c/assessmentService';

export default class DefineSection extends LightningElement {
    @api recordId;

    @track sections = {
        information: {
            isOpen: true,
            isEditing: false,
            title: 'Information'
        },
        roles: {
            isOpen: true,
            isEditing: false,
            title: 'Assessment Roles'
        },
        scoring: {
            isOpen: true,
            isEditing: false,
            title: 'Configure Scoring Ranges'
        },
        systemInfo: {
            isOpen: true,
            title: 'System Information'
        }
    };

    @track assessmentData = {
        name: '',
        checklistName: '',
        startDate: '',
        endDate: '',
        category: '',
        occurrence: '',
        associatedCustomer: '',
        description: '',
        orgComponent: '',
        summary: '',
        status: '',
        administrators: '',
        initiators: '',
        reviewers: '',
        approvers: '',
        respondents: '',
        viewers: '',
        scoringRanges: '[]'
    };

    @track isLoading = true;
    @track error = null;

    @track roles = [
        { name: 'Admin', group: 'IT Security', required: true },
        { name: 'Owner', group: 'Operations', required: true },
        { name: 'Manager', group: 'Compliance', required: false },
        { name: 'Approver', group: 'Executive', required: true },
        { name: 'Reviewer', group: 'Quality', required: false },
        { name: 'Contributor', group: 'Support', required: false }
    ];

    // Available colors for scoring ranges
    @track availableColors = [
        { label: 'Red', value: 'red', colorClass: 'color-indicator red' },
        {
            label: 'Yellow',
            value: 'yellow',
            colorClass: 'color-indicator yellow'
        },
        { label: 'Green', value: 'green', colorClass: 'color-indicator green' },
        { label: 'Blue', value: 'blue', colorClass: 'color-indicator blue' },
        {
            label: 'Purple',
            value: 'purple',
            colorClass: 'color-indicator purple'
        },
        { label: 'Teal', value: 'teal', colorClass: 'color-indicator teal' },
        {
            label: 'Orange',
            value: 'orange',
            colorClass: 'color-indicator orange'
        }
    ];

    @track scoringRanges = [
        {
            id: '1',
            from: '0',
            to: '25',
            color: 'red',
            colorClass: 'color-indicator red',
            isEditing: false
        },
        {
            id: '2',
            from: '26',
            to: '50',
            color: 'yellow',
            colorClass: 'color-indicator yellow',
            isEditing: false
        },
        {
            id: '3',
            from: '51',
            to: '100',
            color: 'teal',
            colorClass: 'color-indicator teal',
            isEditing: false
        }
    ];

    @track systemInfo = {
        createdBy: {
            name: 'John Smith',
            date: '4/15/2025 10:30 AM',
            avatar: '/resources/images/avatar-john.jpg'
        },
        modifiedBy: {
            name: 'Sarah Johnson',
            date: '4/28/2025 2:45 PM',
            avatar: '/resources/images/avatar-sarah.jpg'
        }
    };

    @track isAdminReadonly = true;
    @track isApproverReadonly = true;
    @track isInitiatorReadonly = true;
    @track isRespondentReadonly = true;
    @track isReviewerReadonly = true;
    @track isViewerReadonly = true;

    @track isGeneralInfoOpen = true;
    @track isRolesOpen = false;
    @track isScoringOpen = false;
    @track isSystemInfoOpen = false;

    @track statusInfo = {};

    // Assessment roles data
    roleOptions = {
        administrators: [
            {
                id: 'admin1',
                label: 'System Administrators',
                value: 'system_admins'
            },
            {
                id: 'admin2',
                label: 'Security Administrators',
                value: 'security_admins'
            },
            { id: 'admin3', label: 'Data Administrators', value: 'data_admins' }
        ],
        approvers: [
            { id: 'app1', label: 'Senior Management', value: 'senior_mgmt' },
            { id: 'app2', label: 'Department Heads', value: 'dept_heads' },
            { id: 'app3', label: 'Team Leaders', value: 'team_leaders' }
        ],
        initiators: [
            { id: 'init1', label: 'Project Managers', value: 'project_mgrs' },
            { id: 'init2', label: 'Quality Assurance', value: 'qa_team' },
            {
                id: 'init3',
                label: 'Compliance Officers',
                value: 'compliance_officers'
            }
        ],
        respondents: [
            {
                id: 'resp1',
                label: 'Subject Matter Experts',
                value: 'sme_group'
            },
            { id: 'resp2', label: 'Technical Teams', value: 'tech_teams' },
            { id: 'resp3', label: 'End Users', value: 'end_users' }
        ],
        reviewers: [
            {
                id: 'rev1',
                label: 'Internal Auditors',
                value: 'internal_auditors'
            },
            {
                id: 'rev2',
                label: 'External Reviewers',
                value: 'external_reviewers'
            },
            { id: 'rev3', label: 'Peer Reviewers', value: 'peer_reviewers' }
        ],
        viewers: [
            { id: 'view1', label: 'All Employees', value: 'all_employees' },
            { id: 'view2', label: 'Stakeholders', value: 'stakeholders' },
            {
                id: 'view3',
                label: 'External Partners',
                value: 'external_partners'
            }
        ]
    };

    // Selected role values - default values from backend
    selectedRoles = {
        administrators: 'System Administrators',
        approvers: 'Senior Management',
        initiators: 'Project Managers',
        respondents: 'Subject Matter Experts',
        reviewers: 'Internal Auditors',
        viewers: 'All Employees'
    };

    // Dropdown visibility states
    showDropdowns = {
        administrators: false,
        approvers: false,
        initiators: false,
        respondents: false,
        reviewers: false,
        viewers: false
    };

    // Close dropdown when clicking outside
    handleDocumentClick = (event) => {
        const target = event.target;
        const roleSearchBar = target.closest('.role-search-bar');

        if (!roleSearchBar) {
            // Clicked outside any dropdown, close all
            this.showDropdowns = {
                administrators: false,
                approvers: false,
                initiators: false,
                respondents: false,
                reviewers: false,
                viewers: false
            };
        }
    };

    connectedCallback() {
        this.getCountsData();
        // Add event listener for clicking outside dropdowns
        if (typeof document !== 'undefined') {
            document.addEventListener(
                'click',
                this.handleDocumentClick.bind(this)
            );
        }
    }

    disconnectedCallback() {
        // Remove event listener
        if (typeof document !== 'undefined') {
            document.removeEventListener(
                'click',
                this.handleDocumentClick.bind(this)
            );
        }
    }

    getCountsData() {
        console.log('Fetching counts data from Salesforce...');

        const sessionId =
            '00D7z00000P3CKp!AQEAQJCFx4pttAqtA0yYYLVni.Q.HytoxiCgxHcU4Q4FmKEXusshlZhPKHJyD4OTk0dKC21ZdJLM5iNVhmfaR85skprakHjP';

        const APEX_REST_ENDPOINT_URL_3 =
            'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/lwcossassessments/?operation=getAssessment&recordId=a0A7z000007aJ8MEAU';

        const headers = {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };

        fetch(APEX_REST_ENDPOINT_URL_3, {
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
                // const parsedData = JSON.parse(data);
                console.log('Fetched Assesment:', data.assessments);
                const assessmentData = data.assessments;
                this.loadAssessmentData(assessmentData);
            });
    }

    async initializeData() {
        try {
            this.isLoading = true;
            this.error = null;

            // Use the specific record ID or the one provided as a property
            const targetRecordId = 'a0AO5000008jukbMAA';

            console.log(
                'Fetching assessment data for recordId:',
                targetRecordId
            );
            const assessmentData = await getAssessment(targetRecordId);
            this.loadAssessmentData(assessmentData);
        } catch (error) {
            console.error('Error loading assessment data:', error);
            this.error = error.message;

            // If specific record fails, try to load first available assessment
            try {
                console.log(
                    'Falling back to loading first available assessment'
                );
                const assessments = await getAssessments();
                if (assessments && assessments.length > 0) {
                    this.loadAssessmentData(assessments[0]);
                    this.error = null; // Clear error if fallback succeeds
                } else {
                    this.error = 'No assessments found in Salesforce';
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                this.error =
                    'Failed to load assessment data: ' + fallbackError.message;
            }
        } finally {
            this.isLoading = false;
        }
    }

    loadAssessmentData(assessmentArray) {
        console.log('Loading assessment data:', assessmentArray);
        console.log(
            'Loading assessment data:',
            JSON.stringify(assessmentArray, null, 2)
        );

        // Handle if data comes as an array (take first element)
        const assessment = Array.isArray(assessmentArray)
            ? assessmentArray[0]
            : assessmentArray;

        if (!assessment) {
            console.error('No assessment data found');
            this.error = 'No assessment data found';
            return;
        }

        this.assessmentData = {
            id: assessment.Id || '',
            name: assessment.Name || '',
            checklistName:
                assessment.Rhythm__Template__r?.Name ||
                assessment.Rhythm__Template__c ||
                '',
            startDate: assessment.Rhythm__Start_Date__c || '',
            endDate: assessment.Rhythm__End_Date__c || '',
            category: assessment.Rhythm__Category__c || '',
            occurrence: assessment.Rhythm__Frequency__c || '',
            associatedCustomer:
                assessment.Rhythm__Customer__r?.Name ||
                assessment.Rhythm__Customer__c ||
                '',
            description: assessment.Rhythm__Description__c || '',
            orgComponent: assessment.orgComponent || '',
            summary: assessment.summary || '',
            status: assessment.Rhythm__StatusFormula__c || '',
            administrators: assessment.Rhythm__Administrators__c || '',
            initiators: assessment.Rhythm__Initiators__c || '',
            reviewers: assessment.Rhythm__Reviewers__c || '',
            approvers: assessment.Rhythm__Approvers__c || '',
            respondents: assessment.Rhythm__Respondents__c || '',
            viewers: assessment.Rhythm__Viewers__c || '',
            scoringRanges: assessment.Rhythm__Scoring_Ranges__c || '[]'
        };

        // Load scoring ranges
        try {
            const ranges = JSON.parse(
                assessment.Rhythm__Scoring_Ranges__c || '[]'
            );
            if (ranges && ranges.length > 0) {
                this.scoringRanges = ranges.map((range, index) => ({
                    id: String(index + 1),
                    from: String(range.minvalue || 0),
                    to: String(range.maxvalue || 0),
                    color: this.mapFlagToColor(range.flagUrl),
                    colorClass: `color-indicator ${this.mapFlagToColor(range.flagUrl)}`,
                    isEditing: false
                }));
            }
        } catch (e) {
            console.warn('Error parsing scoring ranges:', e);
        }

        // Load system info
        this.systemInfo = {
            createdBy: {
                name: assessment.CreatedBy?.Name || 'Unknown',
                date: this.formatDate(assessment.CreatedDate),
                avatar: '/resources/images/avatar-default.jpg'
            },
            modifiedBy: {
                name: assessment.LastModifiedBy?.Name || 'Unknown',
                date: this.formatDate(assessment.LastModifiedDate),
                avatar: '/resources/images/avatar-default.jpg'
            }
        };

        // Parse status to extract image information
        this.parseStatusDisplay();
    }

    parseStatusDisplay() {
        if (this.assessmentData.status) {
            // Extract image information from HTML string
            const imgMatch = this.assessmentData.status.match(
                /<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"[^>]*>/
            );
            if (imgMatch) {
                let imageUrl = imgMatch[1];

                // Convert relative Salesforce resource URLs to absolute URLs
                if (imageUrl.startsWith('/resource/')) {
                    imageUrl = `https://customization-app-1405-dev-ed.scratch.my.salesforce.com${imageUrl}`;
                }

                this.statusInfo = {
                    imageUrl: imageUrl,
                    altText: imgMatch[2],
                    hasImage: true
                };

                console.log('Parsed status image:', this.statusInfo);
            } else {
                // If no image found, just use the text content
                this.statusInfo = {
                    text: this.assessmentData.status.replace(/<[^>]*>/g, ''),
                    hasImage: false
                };
                console.log(
                    'No image found in status, using text:',
                    this.statusInfo
                );
            }
        } else {
            console.log('No status data available');
            this.statusInfo = {
                text: 'No status',
                hasImage: false
            };
        }
    }

    // Helper function to map flag URLs to colors
    mapFlagToColor(flagUrl) {
        if (!flagUrl) return 'red';

        if (flagUrl.includes('flag_red')) return 'red';
        if (flagUrl.includes('flag_orange')) return 'orange';
        if (flagUrl.includes('flag_yellow')) return 'yellow';
        if (
            flagUrl.includes('flag_green') ||
            flagUrl.includes('flag_dark_green')
        )
            return 'green';
        if (flagUrl.includes('flag_blue')) return 'blue';
        if (flagUrl.includes('flag_purple')) return 'purple';
        if (flagUrl.includes('flag_teal')) return 'teal';

        return 'red'; // default
    }

    // Handle image load/error events
    handleImageError(event) {
        console.error('Failed to load status image:', event.target.src);
        // Fallback to text display
        this.statusInfo = {
            ...this.statusInfo,
            hasImage: false,
            text: this.statusInfo.altText || 'Status'
        };
    }

    handleImageLoad(event) {
        console.log('Status image loaded successfully:', event.target.src);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    }

    // Toggle section collapse/expand
    toggleSection(event) {
        const sectionName = event.currentTarget.dataset.section;
        this.sections[sectionName].isOpen = !this.sections[sectionName].isOpen;
    }

    // Toggle edit mode for a section
    toggleEdit(event) {
        const sectionName = event.currentTarget.dataset.section;
        this.sections[sectionName].isEditing =
            !this.sections[sectionName].isEditing;
    }

    // Handle field edit icon click
    handleFieldEdit(event) {
        const fieldName = event.currentTarget.dataset.field;
        // In a real app, this would open an inline edit for the specific field
        console.log(`Editing field: ${fieldName}`);
    }

    // Add new scoring range
    handleAddScoringRange() {
        // In a real app, this would open a form to add a new scoring range
        console.log('Adding new scoring range');
    }

    // Enable editing mode for all scoring ranges
    handleEditScoringRanges() {
        // In a real app, this would enable editing mode for all scoring ranges
        console.log('Editing scoring ranges');
    }

    // Delete a specific scoring range
    handleDeleteScoringRange(event) {
        const rangeId = event.currentTarget.dataset.id;
        // In a real app, this would delete the specific scoring range
        console.log(`Deleting scoring range: ${rangeId}`);
    }

    // Handle the recurring assessments checkbox change
    handleCheckboxChange(event) {
        console.log(`Recurring assessments checkbox: ${event.target.checked}`);
    }

    // Handle form field changes
    handleFieldChange(event) {
        const field = event.target.dataset.field;
        this.assessmentData[field] = event.target.value;
        console.log(`Field ${field} changed to:`, event.target.value);
    }

    // Save assessment data
    async handleSaveAssessment() {
        try {
            this.isLoading = true;
            console.log('Saving assessment data:', this.assessmentData);

            const updatedAssessment = await updateAssessment(
                this.assessmentData
            );
            console.log('Assessment saved successfully:', updatedAssessment);

            // Show success message (you could add a toast here)
            this.error = null;
        } catch (error) {
            console.error('Error saving assessment:', error);
            this.error = error.message;
        } finally {
            this.isLoading = false;
        }
    }

    handleLabelClick(event) {
        const role = event.target.dataset.role;
        switch (role) {
            case 'Administrators':
                this.isAdminReadonly = false;
                break;
            case 'Approvers':
                this.isApproverReadonly = false;
                break;
            case 'Initiators':
                this.isInitiatorReadonly = false;
                break;
            case 'Respondents':
                this.isRespondentReadonly = false;
                break;
            case 'Reviewers':
                this.isReviewerReadonly = false;
                break;
            case 'Viewers':
                this.isViewerReadonly = false;
                break;
            default:
                console.warn(`Unknown role: ${role}`);
        }
    }

    toggleGeneralInfo() {
        this.isGeneralInfoOpen = !this.isGeneralInfoOpen;
    }
    toggleRoles() {
        this.isRolesOpen = !this.isRolesOpen;
    }
    toggleScoring() {
        this.isScoringOpen = !this.isScoringOpen;
    }
    toggleSystemInfo() {
        this.isSystemInfoOpen = !this.isSystemInfoOpen;
    }

    // Handle edit button click for a scoring range row
    handleEditRange(event) {
        const rangeId = event.currentTarget.dataset.id;
        this.scoringRanges = this.scoringRanges.map((range) => {
            if (range.id === rangeId) {
                return { ...range, isEditing: true };
            }
            return range;
        });
    }

    // Handle field changes in edit mode
    handleRangeFieldChange(event) {
        const rangeId = event.target.dataset.id;
        const field = event.target.dataset.field;
        const value = event.target.value;

        this.scoringRanges = this.scoringRanges.map((range) => {
            if (range.id === rangeId) {
                return { ...range, [field]: value };
            }
            return range;
        });
    }

    // Handle save button click
    handleSaveRange(event) {
        const rangeId = event.currentTarget.dataset.id;
        // In a real app, you would save changes to the server here

        this.scoringRanges = this.scoringRanges.map((range) => {
            if (range.id === rangeId) {
                return { ...range, isEditing: false };
            }
            return range;
        });

        console.log(
            'Saved range:',
            this.scoringRanges.find((range) => range.id === rangeId)
        );
    }

    // Handle cancel button click
    handleCancelEdit(event) {
        const rangeId = event.currentTarget.dataset.id;

        // Revert changes by getting the original data
        const originalData = this.scoringRanges.find(
            (range) => range.id === rangeId
        );

        this.scoringRanges = this.scoringRanges.map((range) => {
            if (range.id === rangeId) {
                return { ...originalData, isEditing: false };
            }
            return range;
        });
    }

    // Handle delete button click
    handleDeleteRange(event) {
        const rangeId = event.currentTarget.dataset.id;
        // In a real app, you would delete from the server here

        this.scoringRanges = this.scoringRanges.filter(
            (range) => range.id !== rangeId
        );

        console.log(`Deleted scoring range: ${rangeId}`);
    }

    // Add new row functionality for + button
    handleAddNewRow(event) {
        const clickedRowId = event.target.dataset.id;
        console.log('Add new row clicked for:', clickedRowId);

        // Find the clicked row index
        const clickedRowIndex = this.scoringRanges.findIndex(
            (range) => range.id === clickedRowId
        );

        // Create new row object without stageName, with color selection
        const newRow = {
            id: 'new_' + Date.now(),
            from: '',
            to: '',
            color: 'red', // default color
            colorClass: 'color-indicator red',
            isEditing: true,
            isNewRow: true
        };

        // Insert new row below the clicked row
        const updatedRanges = [...this.scoringRanges];
        updatedRanges.splice(clickedRowIndex + 1, 0, newRow);
        this.scoringRanges = updatedRanges;
    }

    // Handle saving new row
    handleSaveNewRow(event) {
        const rowId = event.target.dataset.id;
        const rowIndex = this.scoringRanges.findIndex(
            (range) => range.id === rowId
        );

        if (rowIndex !== -1) {
            // Update row to non-editing mode
            this.scoringRanges[rowIndex].isEditing = false;
            this.scoringRanges[rowIndex].isNewRow = false;
            this.scoringRanges = [...this.scoringRanges];
            console.log('New row saved:', this.scoringRanges[rowIndex]);
        }
    }

    // Handle canceling new row
    handleCancelNewRow(event) {
        const rowId = event.target.dataset.id;
        const rowIndex = this.scoringRanges.findIndex(
            (range) => range.id === rowId
        );

        if (rowIndex !== -1) {
            // Remove the new row
            const updatedRanges = [...this.scoringRanges];
            updatedRanges.splice(rowIndex, 1);
            this.scoringRanges = updatedRanges;
            console.log('New row canceled');
        }
    }

    // Handle color selection change
    handleColorChange(event) {
        const rowId = event.target.dataset.id;
        const selectedColor = event.target.value;

        this.scoringRanges = this.scoringRanges.map((range) => {
            if (range.id === rowId) {
                return {
                    ...range,
                    color: selectedColor,
                    colorClass: `color-indicator ${selectedColor}`
                };
            }
            return range;
        });
    }

    // Role dropdown handlers
    handleRoleDropdownToggle(event) {
        event.preventDefault();
        event.stopPropagation();

        const roleType = event.currentTarget.dataset.role;
        console.log('Toggling dropdown for:', roleType);

        // Close all other dropdowns first
        const newDropdownState = {
            administrators: false,
            approvers: false,
            initiators: false,
            respondents: false,
            reviewers: false,
            viewers: false
        };

        // Toggle the clicked dropdown
        newDropdownState[roleType] = !this.showDropdowns[roleType];

        this.showDropdowns = newDropdownState;
        console.log('Dropdown state updated:', this.showDropdowns);
    }

    handleRoleSelection(event) {
        event.preventDefault();
        event.stopPropagation();

        const roleType = event.currentTarget.dataset.role;
        const selectedLabel = event.currentTarget.dataset.label;

        console.log('Selected role:', roleType, 'with value:', selectedLabel);

        this.selectedRoles = {
            ...this.selectedRoles,
            [roleType]: selectedLabel
        };

        // Close all dropdowns
        this.showDropdowns = {
            administrators: false,
            approvers: false,
            initiators: false,
            respondents: false,
            reviewers: false,
            viewers: false
        };

        console.log('Role selection updated:', this.selectedRoles);
    }

    // Get display value for role input
    getRoleDisplayValue(roleType) {
        return this.selectedRoles[roleType] || 'Select an Option...';
    }

    // Get dropdown options for specific role
    getRoleOptions(roleType) {
        return this.roleOptions[roleType] || [];
    }

    // Check if dropdown is visible
    isDropdownVisible(roleType) {
        return this.showDropdowns[roleType];
    }

    // Getter for arrow rotation class
    get generalInfoArrowClass() {
        return this.isGeneralInfoOpen
            ? 'accordion-arrow rotated'
            : 'accordion-arrow';
    }

    get rolesArrowClass() {
        return this.isRolesOpen ? 'accordion-arrow rotated' : 'accordion-arrow';
    }

    get scoringArrowClass() {
        return this.isScoringOpen
            ? 'accordion-arrow rotated'
            : 'accordion-arrow';
    }

    get systemInfoArrowClass() {
        return this.isSystemInfoOpen
            ? 'accordion-arrow rotated'
            : 'accordion-arrow';
    }
}
