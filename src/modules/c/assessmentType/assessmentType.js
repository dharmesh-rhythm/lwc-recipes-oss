import { LightningElement, api, track } from 'lwc';
import { isOnline } from 'c/utils';

// Salesforce REST API endpoint for Assessment Templates
const ASSESSMENT_TYPE_ENDPOINT =
    'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/assessmenttype';

export default class AssessmentType extends LightningElement {
    @api recordId;

    // Update items property to be an API property with getter/setter
    _items = [];
    @track isLoading = true; // Track loading state
    @track error = null; // Track error state

    @api
    get items() {
        return this._items;
    }

    set items(value) {
        this._items = Array.isArray(value)
            ? value.map((item) => ({
                  ...item,
                  statusClass: this.getStatusClass(item.status)
              }))
            : [];
        // Reset view state when items change
        this.visibleItemCount = this.initialVisibleItems;

        // If items are set externally, we're no longer loading
        if (value && value.length > 0) {
            this.isLoading = false;
        }
    }

    initialVisibleItems = 2; // Initial number of cards to show
    @track visibleItemCount = this.initialVisibleItems;
    @track openDropdown = null;
    @track showRecordTypeModal = false;
    @track showAssessmentModal = false;
    @track showAssessmentAreaModal = false;
    @track selectedRecordType = null;

    connectedCallback() {
        // Set loading state to true when component is initialized
        this.isLoading = true;

        // Initialize mock data only if items is empty
        if (this._items.length === 0) {
            this.loadMockData();
        }

        // Add click event listener to document to close dropdowns
        document.addEventListener('click', this.handleDocumentClick.bind(this));

        // Fetch real data from Salesforce
        this.fetchTemplatesFromSalesforce();
    }

    fetchTemplatesFromSalesforce() {
        if (isOnline()) {
            console.log(
                '🌐 Online: Fetching assessment templates from Salesforce'
            );
            this.isLoading = true;
            this.error = null;

            // Get an OAuth token or session ID
            // In a real app, you would have a proper OAuth flow
            const sessionId =
                '00D7z00000P3CKp!AQEAQIMyD3k_iMTZVUWMArr.hwUFwl.DprNgTqJtGSxb.x.Qa1.5SC6CMC9ciVGG_kyN1CGymuWZGeBzjo1N0tMOwGwf5a7N';

            const headers = {
                Authorization: `Bearer ${sessionId}`,
                'Content-Type': 'application/json'
            };

            fetch(ASSESSMENT_TYPE_ENDPOINT, {
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
                    console.log('✅ Fetched assessment templates:', data);

                    // Transform the data to match our component's format
                    const formattedItems = this.transformTemplateData(data);

                    // Update the items
                    this._items = formattedItems;

                    //Dispatch an event to notify the parent component that data has loaded
                    this.dispatchEvent(
                        new CustomEvent('dataloaded', {
                            detail: {
                                items: this._items
                            }
                        })
                    );
                })
                .catch((error) => {
                    console.error(
                        '❌ Error fetching assessment templates:',
                        error
                    );
                    this.error = error.message;

                    // In case of error, load some fallback data
                    this.loadFallbackData();
                })
                .finally(() => {
                    this.isLoading = false;
                });
        } else {
            console.log('📴 Offline: Using cached or sample data');
            this.error = 'You are currently offline. Showing cached data.';
            this.loadFallbackData();
            this.isLoading = false;
        }
    }

    transformTemplateData(data) {
        // Check if data is an array (direct response) or has a data property (wrapped response)
        const templates = Array.isArray(data) ? data : data.data || [];

        return templates.map((template) => {
            return {
                id: template.id,
                name: template.name,
                status: template.status,
                assessmentArea: template.assessmentArea,
                recordType: template.recordType,
                statusClass: this.getStatusClass(template.status)
            };
        });
    }

    // Method to retry fetching data if there was an error
    retryFetch() {
        if (this.error) {
            this.error = null;
            this.fetchTemplatesFromSalesforce();
        }
    }

    // Load fallback data in case of error or offline
    loadFallbackData() {
        const now = new Date();

        // Create fallback data
        const fallbackItems = [
            {
                id: 'at001',
                name: 'Safety Assessment',
                status: 'Active',
                assessmentArea: 'Workplace Safety',
                recordType: 'Standard',
                statusClass: this.getStatusClass('Active'),
                createdDate: now.toISOString()
            },
            {
                id: 'at002',
                name: 'Quality Control',
                status: 'Draft',
                assessmentArea: 'Manufacturing',
                recordType: 'Standard',
                statusClass: this.getStatusClass('Draft'),
                createdDate: now.toISOString()
            }
        ];

        // Update the items array
        this._items = fallbackItems;

        // Notify parent component that data is loaded (even though it's fallback data)
        this.dispatchEvent(
            new CustomEvent('dataloaded', {
                detail: {
                    items: this._items
                }
            })
        );

        this.isLoading = false;
    }

    disconnectedCallback() {
        // Remove click event listener when component is destroyed
        document.removeEventListener(
            'click',
            this.handleDocumentClick.bind(this)
        );
    }

    // Getters for rendering
    get hasItems() {
        return this._items.length > 0;
    }

    get noData() {
        return !this.isLoading && this._items.length === 0 && !this.error;
    }

    get visibleItems() {
        return this._items.slice(0, this.visibleItemCount);
    }

    /**
     * Returns true if we should show the View More button
     */
    get showViewMoreButton() {
        return this._items.length > this.visibleItemCount;
    }

    // Event handlers
    handleAssessmentClick(event) {
        const id = event.currentTarget.dataset.id;
        const selectedItem = this._items.find((item) => item.id === id);

        // Dispatch view event with the selected item
        this.dispatchEvent(
            new CustomEvent('view', {
                detail: selectedItem
            })
        );
    }

    handleToggleMenu(event) {
        const id = event.currentTarget.dataset.id;

        // Close any open dropdown
        const dropdowns = this.template.querySelectorAll('.dropdown-content');
        dropdowns.forEach((dropdown) => {
            if (dropdown.dataset.id !== id) {
                dropdown.classList.remove('show');
            }
        });

        // Toggle the clicked dropdown
        const clickedDropdown = this.template.querySelector(
            `.dropdown-content[data-id="${id}"]`
        );
        if (clickedDropdown) {
            clickedDropdown.classList.toggle('show');
        }

        // Stop event propagation
        event.stopPropagation();
    }

    // Handle New button click - show record type selection modal
    handleNewClick() {
        this.showRecordTypeModal = true;
    }

    // Handle record type modal close
    handleRecordTypeModalClose() {
        this.showRecordTypeModal = false;
    }

    // Handle record type selection
    handleRecordTypeSelect(event) {
        this.selectedRecordType = event.detail;
        this.showRecordTypeModal = false;

        // Open the appropriate modal based on record type
        if (this.selectedRecordType.value === 'assessmentArea') {
            this.showAssessmentAreaModal = true;
        } else {
            this.showAssessmentModal = true;
        }
    }

    // Handle assessment modal close
    handleAssessmentModalClose() {
        this.showAssessmentModal = false;
        this.selectedRecordType = null;
    }

    // Handle assessment area modal close
    handleAssessmentAreaModalClose() {
        this.showAssessmentAreaModal = false;
        this.selectedRecordType = null;
    }

    // Handle save from assessment modal
    handleSaveAssessment(event) {
        const newAssessment = {
            ...event.detail,
            statusClass: this.getStatusClass(event.detail.status)
        };

        // Add the new assessment to the items array
        this._items = [newAssessment, ...this._items];

        // Close the modal
        this.showAssessmentModal = false;
        this.showAssessmentAreaModal = false;
        this.selectedRecordType = null;
    }

    handleEdit(event) {
        const id = event.currentTarget.dataset.id;
        const selectedItem = this._items.find((item) => item.id === id);

        // Dispatch edit event with the selected item
        this.dispatchEvent(
            new CustomEvent('edit', {
                detail: selectedItem
            })
        );

        // Close the dropdown
        this.closeAllDropdowns();
    }

    handleDelete(event) {
        const id = event.currentTarget.dataset.id;

        // Remove the item from the array
        this._items = this._items.filter((item) => item.id !== id);

        // Close the dropdown
        this.closeAllDropdowns();
    }

    handleViewMore() {
        // Increase the visible item count
        this.visibleItemCount += 5;
    }

    closeAllDropdowns() {
        const dropdowns = this.template.querySelectorAll('.dropdown-content');
        dropdowns.forEach((dropdown) => {
            dropdown.classList.remove('show');
        });
    }

    handleDocumentClick() {
        this.closeAllDropdowns();
    }

    /**
     * Load mock data for demonstration purposes
     */
    loadMockData() {
        // Sample data for the component
        const now = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // Mock assessment type data
        this._items = [
            {
                id: 'type1',
                name: 'Safety Assessment',
                status: 'Active',
                assessmentArea: 'Safety',
                recordType: 'Standard Assessment',
                createdDate: now.toISOString(),
                lastModifiedDate: now.toISOString(),
                statusClass: this.getStatusClass('Active')
            },
            {
                id: 'type2',
                name: 'Quality Control',
                status: 'Draft',
                assessmentArea: 'Quality',
                recordType: 'Standard Assessment',
                createdDate: yesterday.toISOString(),
                lastModifiedDate: yesterday.toISOString(),
                statusClass: this.getStatusClass('Draft')
            },
            {
                id: 'type3',
                name: 'Compliance Review',
                status: 'Inactive',
                assessmentArea: 'Compliance',
                recordType: 'Regulatory Assessment',
                createdDate: yesterday.toISOString(),
                lastModifiedDate: now.toISOString(),
                statusClass: this.getStatusClass('Inactive')
            }
        ];

        // Set loading to false since we now have data
        this.isLoading = false;
    }

    // Helper method to get the appropriate status class
    getStatusClass(status) {
        if (!status) return 'status-default';

        const normalizedStatus = status.toLowerCase();

        switch (normalizedStatus) {
            case 'active':
                return 'status-active';
            case 'inactive':
                return 'status-inactive';
            case 'draft':
                return 'status-draft';
            case 'archived':
                return 'status-archived';
            case 'completed':
            case 'done':
            case 'finished':
                return 'status-completed';
            case 'in progress':
            case 'ongoing':
            case 'started':
                return 'status-in-progress';
            case 'pending':
            case 'not started':
            case 'todo':
                return 'status-pending';
            case 'blocked':
            case 'stopped':
            case 'halted':
                return 'status-blocked';
            default:
                return 'status-default';
        }
    }
}
