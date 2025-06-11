// checklist.js

import { LightningElement, api } from 'lwc';
import { isOnline } from 'c/utils';

// Salesforce REST API endpoint for Assessment Templates
const ASSESSMENT_TEMPLATES_ENDPOINT =
    'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/assessmenttemplates';

export default class Checklist extends LightningElement {
    @api
    get items() {
        return this._items || [];
    }

    set items(value) {
        this._items = Array.isArray(value)
            ? value.map((item) => {
                  return {
                      ...item,
                      statusClass: this.getStatusClass(item.status),
                      formattedLastModifiedDate: item.lastModifiedDate
                          ? this.formatDate(item.lastModifiedDate)
                          : '',
                      formattedCreatedDate: item.createdDate
                          ? this.formatSimpleDate(item.createdDate)
                          : item.lastModifiedDate
                            ? this.formatSimpleDate(item.lastModifiedDate)
                            : ''
                  };
              })
            : [];

        // Reset view state when items change
        this.visibleItemCount = this.initialVisibleItems;
        // Close any open dropdowns when items change
        this.activeDropdown = null;
    }

    _items = [];
    initialVisibleItems = 2; // Initial number of cards to show
    visibleItemCount = this.initialVisibleItems;
    activeDropdown = null; // Tracks which dropdown is currently open
    isLoading = true;
    error = null;

    /**
     * Returns the items that should be visible in the mobile view
     */
    get visibleItems() {
        return this.items.slice(0, this.visibleItemCount);
    }

    /**
     * Returns true if there are items to display
     */
    get hasItems() {
        return this.items.length > 0;
    }

    /**
     * Returns true if there are no items to display
     */
    get noData() {
        return !this.hasItems && !this.isLoading;
    }

    /**
     * Returns true if we should show the View More button
     */
    get showViewMoreButton() {
        return this.items.length > this.visibleItemCount;
    }

    /**
     * Handle the View More button click
     */
    handleViewMore() {
        // Show all remaining items
        this.visibleItemCount = this.items.length;
    }

    /**
     * Handle checklist item click
     */
    handleChecklistClick(event) {
        const itemId = event.currentTarget.dataset.id;
        const selectedItem = this.items.find((item) => item.id === itemId);

        // Dispatch view event with item details
        if (selectedItem) {
            console.log(
                'Checklist item clicked, dispatching view event:',
                selectedItem
            );

            this.dispatchEvent(
                new CustomEvent('view', {
                    detail: {
                        itemId: itemId,
                        item: selectedItem
                    }
                })
            );
            console.log('Selected checklist item:', selectedItem);
        }
    }

    /**
     * Handle toggling the dropdown menu
     */
    handleToggleMenu(event) {
        // Get the item ID from the clicked element
        const itemId = event.currentTarget.dataset.id;

        // Find all dropdown menus
        const allDropdowns =
            this.template.querySelectorAll('.dropdown-content');

        // Close all dropdowns first
        allDropdowns.forEach((dropdown) => {
            if (
                dropdown.dataset.id !== itemId ||
                (dropdown.dataset.id === itemId &&
                    dropdown.classList.contains('show'))
            ) {
                dropdown.classList.remove('show');
            }
        });

        // Toggle the dropdown for the clicked item
        const dropdown = this.template.querySelector(
            `.dropdown-content[data-id="${itemId}"]`
        );
        if (dropdown) {
            if (!dropdown.classList.contains('show')) {
                dropdown.classList.add('show');
                this.activeDropdown = itemId;
            } else {
                this.activeDropdown = null;
            }
        }

        // Prevent event from bubbling up
        event.stopPropagation();
    }

    /**
     * Close all dropdowns when clicking outside
     */
    connectedCallback() {
        // Add click event listener to document to close dropdown when clicking outside
        this.documentClickListener = this.handleDocumentClick.bind(this);
        document.addEventListener('click', this.documentClickListener);

        // Fetch data from Salesforce org
        this.fetchTemplatesFromSalesforce();
    }

    /**
     * Fetch assessment templates from Salesforce using REST API
     */
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
                '00D7z00000P3CKp!AQEAQOVQIkoHIawh0ULeO64_o.lnrBfzv5KGfj4.rZkOqZR7K7gRKMPoibN84yZoh19BKBjz0XgNiB04.LGcmrLc.8_1rkRU';
            const headers = {
                Authorization: `Bearer ${sessionId}`,
                'Content-Type': 'application/json'
            };

            fetch(ASSESSMENT_TEMPLATES_ENDPOINT, {
                method: 'GET',
                headers: headers,
                credentials: 'same-origin' // This includes cookies for authentication
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
        }
    }

    /**
     * Transform Salesforce template data to the format expected by our component
     */
    transformTemplateData(data) {
        // Check if data is an array (direct response) or has a data property (wrapped response)
        const templates = Array.isArray(data) ? data : data.data || [];

        return templates.map((template) => {
            return {
                id: template.id,
                name: template.name,
                status: template.status,
                category: template.category,
                createdBy: 'Salesforce User',
                lastModifiedBy: 'Salesforce User',
                createdDate: template.createdDate,
                lastModifiedDate: template.lastModifiedDate,
                assessmentType: template.assessmentType,
                statusClass: this.getStatusClass(template.status),
                formattedLastModifiedDate: this.formatDate(
                    template.lastModifiedDate
                ),
                formattedCreatedDate: this.formatSimpleDate(
                    template.createdDate
                ),
                // Add additional fields from the Apex TemplateDTO
                numberOfAssessment: template.numberOfAssessment,
                createdFor: template.createdFor,
                description: template.description
            };
        });
    }

    /**
     * Load fallback data when offline or on error
     */
    loadFallbackData() {
        // Get current date and some past dates for fallback data
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);

        // Sample data
        const fallbackItems = [
            {
                id: 'item1',
                name: 'Safety Assessment Template',
                status: 'Active',
                category: 'Safety',
                createdBy: 'System Admin',
                lastModifiedBy: 'System Admin',
                createdDate: lastWeek.toISOString(),
                lastModifiedDate: yesterday.toISOString()
            },
            {
                id: 'item2',
                name: 'Quality Control Template',
                status: 'Draft',
                category: 'Quality',
                createdBy: 'System Admin',
                lastModifiedBy: 'System Admin',
                createdDate: lastWeek.toISOString(),
                lastModifiedDate: now.toISOString()
            }
        ];

        // Format the items
        this._items = fallbackItems.map((item) => {
            return {
                ...item,
                statusClass: this.getStatusClass(item.status),
                formattedLastModifiedDate: this.formatDate(
                    item.lastModifiedDate
                ),
                formattedCreatedDate: this.formatSimpleDate(item.createdDate)
            };
        });

        // Also dispatch dataloaded event with fallback data
        this.dispatchEvent(
            new CustomEvent('dataloaded', {
                detail: {
                    items: this._items
                }
            })
        );

        // Also dispatch dataloaded event with fallback data
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
        // Remove document click listener when component is destroyed
        document.removeEventListener('click', this.documentClickListener);
    }

    handleDocumentClick() {
        // Close any open dropdowns
        const allDropdowns = this.template.querySelectorAll(
            '.dropdown-content.show'
        );
        if (allDropdowns.length > 0) {
            allDropdowns.forEach((dropdown) => {
                dropdown.classList.remove('show');
            });
            this.activeDropdown = null;
        }
    }

    /**
     * Handle edit button click
     */
    handleEdit(event) {
        const itemId = event.currentTarget.dataset.id;
        const selectedItem = this.items.find((item) => item.id === itemId);

        // Dispatch edit event with item details
        if (selectedItem) {
            this.dispatchEvent(
                new CustomEvent('edit', {
                    detail: {
                        itemId: itemId,
                        item: selectedItem
                    }
                })
            );
        }

        // Close the dropdown
        this.closeDropdown(itemId);
    }

    /**
     * Handle delete button click
     */
    handleDelete(event) {
        const itemId = event.currentTarget.dataset.id;

        // Dispatch delete event with item id
        this.dispatchEvent(
            new CustomEvent('delete', {
                detail: {
                    itemId: itemId
                }
            })
        );

        // Close the dropdown
        this.closeDropdown(itemId);
    }

    /**
     * Helper to close a specific dropdown
     */
    closeDropdown(itemId) {
        const dropdown = this.template.querySelector(
            `.dropdown-content[data-id="${itemId}"]`
        );
        if (dropdown) {
            dropdown.classList.remove('show');
            this.activeDropdown = null;
        }
    }

    /**
     * Returns a CSS class based on the status
     */
    getStatusClass(status) {
        if (!status) return 'status-default';

        const normalizedStatus = status.toLowerCase();

        switch (normalizedStatus) {
            case 'completed':
            case 'done':
            case 'finished':
            case 'active':
                return 'status-completed';

            case 'in progress':
            case 'ongoing':
            case 'started':
                return 'status-in-progress';

            case 'pending':
            case 'not started':
            case 'todo':
            case 'draft':
                return 'status-pending';

            case 'blocked':
            case 'stopped':
            case 'halted':
            case 'inactive':
                return 'status-blocked';

            default:
                return 'status-default';
        }
    }

    /**
     * Formats a date string or timestamp into a readable format
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return '';
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }

    /**
     * Formats a date into MM/DD/YYYY format
     */
    formatSimpleDate(dateString) {
        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return '';
            }

            return new Intl.DateTimeFormat('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }
}
