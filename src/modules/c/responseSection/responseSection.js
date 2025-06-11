import { LightningElement, api, track } from 'lwc';

export default class ResponseSection extends LightningElement {
    @api recordId;
    @track totalResponses = 0;
    @track isFirstPage = true;
    @track isLastPage = true;
    @track paginationText = '0 items • page 0 of 0';
    @track currentPage = 1;
    @track pageSize = 10;
    @track displayedResponses = [];
    @track sortField = 'name';
    @track sortDirection = 'asc';
    @track selectedRows = new Set();
    @track rtmvpcAssessmentDetail = false;

    _responses = [
        {
            id: '1',
            name: 'Kathryn Murphy',
            completed: 85,
            score: 92,
            status: 'Active',
            submissionDate: '04/05/2024',
            followUpCount: 3,
            reports: 'View Report'
        },
        {
            id: '2',
            name: 'Floyd Miles',
            completed: 75,
            score: 88,
            status: 'Active',
            submissionDate: '06/12/2024',
            followUpCount: 2,
            reports: 'View Report'
        },
        {
            id: '3',
            name: 'Courtney Henry',
            completed: 92,
            score: 95,
            status: 'Active',
            submissionDate: '09/09/2024',
            followUpCount: 1,
            reports: 'View Report'
        },
        {
            id: '4',
            name: 'Jenny Wilson',
            completed: 78,
            score: 85,
            status: 'Inactive',
            submissionDate: '03/15/2024',
            followUpCount: 4,
            reports: 'View Report'
        },
        {
            id: '5',
            name: 'Robert Fox',
            completed: 95,
            score: 98,
            status: 'Active',
            submissionDate: '05/20/2024',
            followUpCount: 0,
            reports: 'View Report'
        },
        {
            id: '6',
            name: 'Wade Cooper',
            completed: 65,
            score: 72,
            status: 'Inactive',
            submissionDate: '02/28/2024',
            followUpCount: 5,
            reports: 'View Report'
        },
        {
            id: '7',
            name: 'Esther Howard',
            completed: 88,
            score: 90,
            status: 'Active',
            submissionDate: '07/01/2024',
            followUpCount: 2,
            reports: 'View Report'
        },
        {
            id: '8',
            name: 'Leslie Alexander',
            completed: 70,
            score: 78,
            status: 'Active',
            submissionDate: '04/18/2024',
            followUpCount: 3,
            reports: 'View Report'
        },
        {
            id: '9',
            name: 'Guy Hawkins',
            completed: 82,
            score: 87,
            status: 'Active',
            submissionDate: '05/30/2024',
            followUpCount: 1,
            reports: 'View Report'
        },
        {
            id: '10',
            name: 'Cameron Williamson',
            completed: 90,
            score: 94,
            status: 'Active',
            submissionDate: '06/25/2024',
            followUpCount: 0,
            reports: 'View Report'
        },
        {
            id: '11',
            name: 'Devon Lane',
            completed: 88,
            score: 91,
            status: 'Active',
            submissionDate: '07/15/2024',
            followUpCount: 2,
            reports: 'View Report'
        },
        {
            id: '12',
            name: 'Bessie Cooper',
            completed: 73,
            score: 80,
            status: 'Inactive',
            submissionDate: '03/10/2024',
            followUpCount: 4,
            reports: 'View Report'
        },
        {
            id: '13',
            name: 'Theresa Webb',
            completed: 94,
            score: 96,
            status: 'Active',
            submissionDate: '08/05/2024',
            followUpCount: 1,
            reports: 'View Report'
        },
        {
            id: '14',
            name: 'Jerome Bell',
            completed: 81,
            score: 85,
            status: 'Active',
            submissionDate: '05/25/2024',
            followUpCount: 3,
            reports: 'View Report'
        },
        {
            id: '15',
            name: 'Savannah Nguyen',
            completed: 89,
            score: 93,
            status: 'Active',
            submissionDate: '06/30/2024',
            followUpCount: 2,
            reports: 'View Report'
        },
        {
            id: '16',
            name: 'Ralph Edwards',
            completed: 67,
            score: 75,
            status: 'Inactive',
            submissionDate: '04/12/2024',
            followUpCount: 5,
            reports: 'View Report'
        },
        {
            id: '17',
            name: 'Kristin Watson',
            completed: 86,
            score: 89,
            status: 'Active',
            submissionDate: '07/08/2024',
            followUpCount: 2,
            reports: 'View Report'
        },
        {
            id: '18',
            name: 'Jacob Jones',
            completed: 91,
            score: 94,
            status: 'Active',
            submissionDate: '06/15/2024',
            followUpCount: 1,
            reports: 'View Report'
        }
    ];

    get responses() {
        return this._responses;
    }

    set responses(value) {
        this._responses = value.map((response) => ({
            ...response,
            isSelected: this.selectedRows.has(response.id),
            rowClass: this.selectedRows.has(response.id)
                ? 'slds-hint-parent selected-row'
                : 'slds-hint-parent'
        }));
    }

    @track columns = [
        {
            label: 'Name',
            fieldName: 'name',
            isLink: true,
            sortable: true,
            style: 'width: 200px'
        },
        {
            label: 'Status',
            fieldName: 'status',
            isLink: false,
            sortable: true,
            style: 'width: 120px'
        },
        {
            label: 'Created Date',
            fieldName: 'createdDate',
            isLink: false,
            sortable: true,
            style: 'width: 150px'
        },
        {
            label: '% Completed',
            fieldName: 'percentCompleted',
            type: 'number',
            sortable: true,
            width: 130,
            style: 'width: 130px;'
        },
        {
            label: '% Score',
            fieldName: 'percentScore',
            type: 'number',
            sortable: true,
            wrapText: false,
            initialWidth: 110
        },
        {
            label: 'Submission Date',
            fieldName: 'submissionDate',
            type: 'date',
            sortable: true,
            wrapText: false,
            initialWidth: 150
        },
        {
            label: '#Follow Up Requests',
            fieldName: 'followUpRequests',
            type: 'number',
            sortable: true,
            wrapText: false,
            initialWidth: 160
        },
        {
            label: 'Reports & Analytics',
            fieldName: 'reportsAnalytics',
            sortable: true,
            wrapText: false,
            initialWidth: 160
        }
    ];

    @track data = [];
    @track totalRecords = 0;

    // Column resizing properties
    resizing = false;
    startX = 0;
    startWidth = 0;
    currentColumn = null;

    @track lastClickedRow = null;

    @track resizingColumn = null;
    @track activeDropdown = null;

    @track showDropdown = false;
    @track dropdownStyle = '';

    selectedRecordId = null;

    connectedCallback() {
        this._responses = this.responses.map((response) => ({
            ...response,
            isSelected: false,
            rowClass: 'slds-hint-parent'
        }));
        this.totalResponses = this.responses.length;
        this.sortData();
        this.updateDisplayedResponses();
        this.updatePaginationInfo();
        this.fetchAssessmentResponses();
        window.addEventListener('click', this.handleClickOutside.bind(this));
    }

    async fetchAssessmentResponses() {
        try {
            const sessionId =
                '00D7z00000P3CKp!AQEAQGSNaMfLNbnlNRboHASSwSmukK7U8rXWt_oczvIGeWu2vIVDhORo.ID1bpF6SWVy.zZWiLp6G3BqzsWa4ai8wqRe9FSl';
            const response = await fetch(
                'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/account-assessment-relations',
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${sessionId}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Failed to fetch data:', errorText);
                return;
            }

            const records = await response.json();
            console.log('✅ Raw records from Apex:', records);

            // Transform backend fields into your frontend structure
            this._responses = records.map((record, index) => ({
                id: record.Id || `${index + 1}`,
                name: record.Name,
                completed: record.Rhythm__Completed__c?.replace('%', ''),
                score: record.Rhythm__Percentage_Score__c?.replace('%', ''),
                status: record.Rhythm__Status__c,
                submissionDate:
                    record.Rhythm__Submission_Date__c?.split('T')[0], // Format date
                followUpCount: record.Rhythm__Follow_Up_Requests__c,
                reports: record.Rhythm__Reports_Analytics__c
            }));

            console.log('✅ Transformed responses:', this._responses);

            this.totalResponses = this._responses.length;
            this.sortData();
            this.updateDisplayedResponses();
            console.log(
                '✅ Final displayed responses:',
                this.displayedResponses
            );
            this.updatePaginationInfo();
        } catch (error) {
            console.error('❌ Exception in fetchAssessmentResponses:', error);
            // Log more details about the error
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }
    }
    handleNameClick(event) {
        const recordId = event.currentTarget.dataset.id;
        console.log('Clicked response ID:', recordId);

        // Your navigation or detail view logic here:
        this.rtmvpcAssessmentDetail = true;
        this.selectedResponseId = recordId;
        this.showDetailView = true;
    }
    handleClosertmvpcAssessmentDetail() {
        this.rtmvpcAssessmentDetail = false;
    }

    handleSort(event) {
        const column = event.currentTarget.dataset.column;
        const direction = event.currentTarget.dataset.direction;

        // Remove active class from all sort icons
        this.template.querySelectorAll('.sort-icon').forEach((icon) => {
            icon.classList.remove('active');
        });

        // Add active class to clicked icon
        event.currentTarget.classList.add('active');

        this.sortField = column;
        this.sortDirection = direction;
        this.sortData();
        this.updateDisplayedResponses();
    }

    sortData() {
        let sortedData = [...this.responses];
        const isReverse = this.sortDirection === 'desc';

        sortedData.sort((a, b) => {
            let valueA = a[this.sortField];
            let valueB = b[this.sortField];

            // Handle numeric fields
            if (
                ['completed', 'score', 'followUpCount'].includes(this.sortField)
            ) {
                valueA = Number(valueA);
                valueB = Number(valueB);
            }
            // Handle date field
            else if (this.sortField === 'submissionDate') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }
            // Handle string fields
            else {
                valueA = valueA ? valueA.toLowerCase() : '';
                valueB = valueB ? valueB.toLowerCase() : '';
            }

            if (valueA < valueB) {
                return isReverse ? 1 : -1;
            }
            if (valueA > valueB) {
                return isReverse ? -1 : 1;
            }
            return 0;
        });

        this.responses = sortedData;
    }

    updateDisplayedResponses() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.displayedResponses = this.responses
            .slice(start, end)
            .map((response) => ({
                ...response,
                isSelected: this.selectedRows.has(response.id),
                rowClass: this.selectedRows.has(response.id)
                    ? 'slds-hint-parent selected-row'
                    : 'slds-hint-parent'
            }));

        // Add debug log
        console.log('📊 Updated displayed responses:', {
            page: this.currentPage,
            pageSize: this.pageSize,
            totalRecords: this.responses.length,
            displayedRecords: this.displayedResponses.length,
            records: this.displayedResponses
        });

        // Update pagination state
        this.isFirstPage = this.currentPage === 1;
        this.isLastPage = end >= this.responses.length;
    }

    updatePaginationInfo() {
        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(start + this.pageSize - 1, this.totalResponses);
        const totalPages = Math.ceil(this.totalResponses / this.pageSize);
        this.paginationText = `${start}-${end} of ${this.totalResponses} • Page ${this.currentPage} of ${totalPages}`;
    }

    handleResizeStart(event) {
        event.preventDefault();

        const header = event.target.closest('th');
        if (!header) return;

        this.resizingColumn = header;
        this.startX = event.clientX;
        this.startWidth = header.offsetWidth;

        window.addEventListener('mousemove', this.handleResizeMove.bind(this));
        window.addEventListener('mouseup', this.handleResizeEnd.bind(this));

        event.target.classList.add('resizing');
    }

    handleResizeMove(event) {
        if (!this.resizingColumn) return;

        const width = this.startWidth + (event.clientX - this.startX);

        // Enforce minimum width based on column type
        const minWidth =
            this.resizingColumn.dataset.column === 'name' ? 150 : 100;
        if (width >= minWidth) {
            this.resizingColumn.style.width = `${width}px`;
        }
    }

    handleResizeEnd() {
        if (!this.resizingColumn) return;

        window.removeEventListener(
            'mousemove',
            this.handleResizeMove.bind(this)
        );
        window.removeEventListener('mouseup', this.handleResizeEnd.bind(this));

        const handle = this.resizingColumn.querySelector('.resize-handle');
        if (handle) {
            handle.classList.remove('resizing');
        }

        this.resizingColumn = null;
    }

    handleClickOutside(event) {
        if (
            !event.target.closest('.action-trigger') &&
            !event.target.closest('.action-dropdown')
        ) {
            this.closeDropdown();
        }
    }

    closeDropdown() {
        this.showDropdown = false;
        this.selectedRecordId = null;
    }

    handleRowAction(event) {
        event.stopPropagation();
        const trigger = event.currentTarget;
        const recordId = trigger.dataset.id;

        // If clicking the same trigger, toggle the dropdown
        if (this.selectedRecordId === recordId) {
            this.closeDropdown();
            return;
        }

        // Position the dropdown next to the trigger
        const rect = trigger.getBoundingClientRect();
        const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft;

        this.dropdownStyle = `
            top: ${rect.top + scrollTop}px;
            left: ${rect.right + scrollLeft + 5}px;
        `;

        this.selectedRecordId = recordId;
        this.showDropdown = true;
    }

    handleEdit(event) {
        event.stopPropagation();
        console.log('Edit record:', this.selectedRecordId);
        this.closeDropdown();
    }

    handleDelete(event) {
        event.stopPropagation();
        console.log('Delete record:', this.selectedRecordId);
        this.closeDropdown();
    }

    handleNew() {
        console.log('New response');
    }

    handleRefresh() {
        console.log('Refresh list');
    }

    handleShare() {
        console.log('Share');
    }

    handlePageChange(event) {
        const direction = event.currentTarget.dataset.page;
        if (direction === 'prev' && !this.isFirstPage) {
            this.currentPage--;
        } else if (direction === 'next' && !this.isLastPage) {
            this.currentPage++;
        }
        this.updateDisplayedResponses();
        this.updatePaginationInfo();
    }

    get deleteButtonClass() {
        return `delete-selected-button ${this.selectedRows.size > 0 ? 'visible' : ''}`;
    }

    get selectedCount() {
        return this.selectedRows.size;
    }

    handleDeleteSelected() {
        const selectedIds = Array.from(this.selectedRows);
        this._responses = this._responses.filter(
            (response) => !selectedIds.includes(response.id)
        );
        this.selectedRows.clear();
        this.totalResponses = this._responses.length;
        this.sortData();
        this.updateDisplayedResponses();
        this.updatePaginationInfo();
    }

    handleSelectAll(event) {
        const isChecked = event.target.checked;
        this.selectedRows.clear();

        if (isChecked) {
            this.responses.forEach((response) => {
                this.selectedRows.add(response.id);
            });
        }

        this.responses = [...this._responses]; // Trigger setter
        this.updateDisplayedResponses();
    }

    handleRowSelect(event) {
        event.stopPropagation();
        const recordId = event.target.dataset.id;
        const isChecked = event.target.checked;

        if (isChecked) {
            this.selectedRows.add(recordId);
        } else {
            this.selectedRows.delete(recordId);
        }

        this.responses = [...this._responses]; // Trigger setter
        this.updateDisplayedResponses();
    }

    async handleRestore() {
        const columns = this.template.querySelectorAll('.resizable-column');
        this.isResizing = true;

        columns.forEach((column) => {
            const dataColumn = column.getAttribute('data-column');
            switch (dataColumn) {
                case 'name':
                    column.style.width = '200px';
                    break;
                case 'completed':
                case 'score':
                    column.style.width = '140px';
                    break;
                case 'status':
                    column.style.width = '120px';
                    break;
                case 'submissionDate':
                    column.style.width = '180px';
                    break;
                case 'followUp':
                    column.style.width = '200px';
                    break;
                case 'reports':
                    column.style.width = '180px';
                    break;
                default:
                    column.style.width = '150px';
                    break;
            }
            column.classList.add('default-column-width');
        });

        await Promise.resolve();
        this.isResizing = false;
    }

    disconnectedCallback() {
        window.removeEventListener('click', this.handleClickOutside.bind(this));
        window.removeEventListener(
            'mousemove',
            this.handleResizeMove.bind(this)
        );
        window.removeEventListener('mouseup', this.handleResizeEnd.bind(this));
        // =======

        //     @track responses = [
        //         {
        //             id: '1',
        //             supplier: 'ABC Manufacturing',
        //             completedPercent: 100,
        //             score: 85,
        //             status: 'Completed',
        //             submissionDate: '5/15/2025',
        //             followUps: 2,
        //             isCompleted: true,
        //             isInProgress: false
        //         },
        //         {
        //             id: '2',
        //             supplier: 'XYZ Components',
        //             completedPercent: 100,
        //             score: 92,
        //             status: 'Completed',
        //             submissionDate: '5/16/2025',
        //             followUps: 0,
        //             isCompleted: true,
        //             isInProgress: false
        //         },
        //         {
        //             id: '3',
        //             supplier: 'Precision Parts Inc',
        //             completedPercent: 75,
        //             score: 0,
        //             status: 'In Progress',
        //             submissionDate: '--',
        //             followUps: 1,
        //             isCompleted: false,
        //             isInProgress: true
        //         },
        //         {
        //             id: '4',
        //             supplier: 'Global Supplies Ltd',
        //             completedPercent: 100,
        //             score: 78,
        //             status: 'Completed',
        //             submissionDate: '5/20/2025',
        //             followUps: 3,
        //             isCompleted: true,
        //             isInProgress: false
        //         },
        //         {
        //             id: '5',
        //             supplier: 'Tech Solutions Corp',
        //             completedPercent: 50,
        //             score: 0,
        //             status: 'In Progress',
        //             submissionDate: '--',
        //             followUps: 0,
        //             isCompleted: false,
        //             isInProgress: true
        //         }
        //     ];

        //     @track sortBy = 'supplier';
        //     @track sortDirection = 'asc';

        //     get totalResponses() {
        //         return this.responses.length;
        //     }

        //     get lastUpdated() {
        //         return new Date().toLocaleString();
        //     }

        //     handleSort(event) {
        //         const fieldName = event.currentTarget.dataset.fieldName;
        //         const sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';

        //         this.sortBy = fieldName;
        //         this.sortDirection = sortDirection;

        //         // Clone the data
        //         let cloneData = [...this.responses];

        //         // Sort the data
        //         cloneData.sort((a, b) => {
        //             const sortAsc = sortDirection === 'asc';
        //             const val1 = a[this.sortBy];
        //             const val2 = b[this.sortBy];

        //             // Special handling for numbers and strings
        //             if (typeof val1 === 'number' && typeof val2 === 'number') {
        //                 return sortAsc ? val1 - val2 : val2 - val1;
        //             }
        //             const val1Str = String(val1).toLowerCase();
        //             const val2Str = String(val2).toLowerCase();
        //             return sortAsc
        //                 ? val1Str.localeCompare(val2Str)
        //                 : val2Str.localeCompare(val1Str);
        //         });

        //         this.responses = cloneData;
        //     }

        //     handleRefresh() {
        //         // In a real app, this would fetch fresh data from the backend
        //         console.log('Refreshing data...');
        //     }

        //     handleSendEmail() {
        //         // In a real app, this would open a modal to compose an email
        //         console.log('Opening email composer...');
        //     }

        //     handleSettings() {
        //         // In a real app, this would open settings
        //         console.log('Opening settings...');
        //     }

        //     handleRowAction(event) {
        //         const actionName = event.detail.action.name;
        //         const row = event.detail.row;

        //         // Handle the action based on name
        //         if (actionName === 'view') {
        //             // Handle view action
        //             console.log('Viewing response:', row);
        //         }
        //     }
    }
}
