//checklistDemo.js
import { LightningElement, track, api } from 'lwc';

export default class ChecklistDemo extends LightningElement {
    @track checklistItems = [];
    @track showDetailView = false;
    @track selectedChecklistId = null;
    @track selectedChecklist = null;
    @track showChecklistModal = false;
    @track originalChecklistItems = [];
    @track searchTerm = '';

    // Computed property to determine if list view should be shown
    get showListView() {
        return !this.showDetailView;
    }

    connectedCallback() {
        // Initialize with sample data when component is inserted into the DOM
        this.initSampleData();

        // Debug: Log initial state
        console.log('ChecklistDemo initialized');
    }

    // initSampleData() {
    //     // Get current date and some past dates for the demo
    //     const now = new Date();
    //     const yesterday = new Date(now);
    //     yesterday.setDate(yesterday.getDate() - 1);

    //     const lastWeek = new Date(now);
    //     lastWeek.setDate(lastWeek.getDate() - 7);

    //     const twoWeeksAgo = new Date(now);
    //     twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    //     // Create sample checklist items
    //     this.checklistItems = [
    //         {
    //             id: 'item1',
    //             name: 'SIF Alert',
    //             status: 'Completed',
    //             category: 'Health & Safety',
    //             createdBy: 'John Smith',
    //             lastModifiedBy: 'Jane Doe',
    //             createdDate: twoWeeksAgo.toISOString(),
    //             lastModifiedDate: now.toISOString(),
    //             customer: 'Alpha Corporation',
    //             occurrence: 'One Time',
    //             startDate: '5/1/2025',
    //             endDate: '5/31/2025',
    //             description: 'description',
    //             orgComponent: 'Spare Parts Room'
    //         },
    //         {
    //             id: 'item2',
    //             name: 'Checklist 17-B2',
    //             status: 'In Progress',
    //             category: 'Beta Industries',
    //             createdBy: 'Alex Johnson',
    //             lastModifiedBy: 'Alex Johnson',
    //             createdDate: lastWeek.toISOString(),
    //             lastModifiedDate: yesterday.toISOString()
    //         },
    //         {
    //             id: 'item3',
    //             name: 'Checklist 18-C4',
    //             status: 'Pending',
    //             category: 'Gamma Services',
    //             createdBy: 'Sarah Williams',
    //             lastModifiedBy: 'Mike Brown',
    //             createdDate: lastWeek.toISOString(),
    //             lastModifiedDate: lastWeek.toISOString()
    //         },
    //         {
    //             id: 'item4',
    //             name: 'Checklist 19-D7',
    //             status: 'Blocked',
    //             category: 'Delta Tech',
    //             createdBy: 'David Wilson',
    //             lastModifiedBy: 'David Wilson',
    //             createdDate: yesterday.toISOString(),
    //             lastModifiedDate: lastWeek.toISOString()
    //         },
    //         {
    //             id: 'item5',
    //             name: 'Checklist 20-E9',
    //             status: 'Pending',
    //             category: 'Epsilon Solutions',
    //             createdBy: 'Emily Taylor',
    //             lastModifiedBy: 'John Smith',
    //             createdDate: yesterday.toISOString(),
    //             lastModifiedDate: yesterday.toISOString()
    //         },
    //         {
    //             id: 'item6',
    //             name: 'Checklist 21-F3',
    //             status: 'In Progress',
    //             category: 'Zeta Consulting',
    //             createdBy: 'Mike Brown',
    //             lastModifiedBy: 'Alex Johnson',
    //             createdDate: now.toISOString(),
    //             lastModifiedDate: now.toISOString()
    //         }
    //     ];

    //     // Store the original items for filtering
    //     this.originalChecklistItems = [...this.checklistItems];
    // }

    handleAddItem() {
        // Sample data for random selection
        const statuses = ['Completed', 'In Progress', 'Pending', 'Blocked'];
        const categories = [
            'Planning',
            'Design',
            'Development',
            'Testing',
            'Deployment'
        ];
        const names = [
            'Review Pull Request',
            'Update Documentation',
            'Fix Bug in Login System',
            'Optimize Database Queries',
            'Deploy to Production',
            'Create User Manual'
        ];
        const users = [
            'John Smith',
            'Jane Doe',
            'Alex Johnson',
            'Sarah Williams',
            'Mike Brown',
            'David Wilson'
        ];

        // Get random values
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomStatus =
            statuses[Math.floor(Math.random() * statuses.length)];
        const randomCategory =
            categories[Math.floor(Math.random() * categories.length)];
        const randomCreator = users[Math.floor(Math.random() * users.length)];
        const randomModifier = users[Math.floor(Math.random() * users.length)];

        // Create a new item with random data
        const newItem = {
            id: 'item' + (this.checklistItems.length + 5),
            name: randomName,
            status: randomStatus,
            category: randomCategory,
            createdBy: randomCreator,
            lastModifiedBy: randomModifier,
            lastModifiedDate: new Date().toISOString()
        };

        // Add to the existing items
        this.checklistItems = [...this.checklistItems, newItem];
    }

    handleResetItems() {
        // Reset to initial sample data
        this.initSampleData();
    }

    // Handle the checklist selection event
    handleChecklistSelect(event) {
        console.log('handleChecklistSelect called in checklistDemo component');

        // Check if we received the expected data
        if (!event || !event.detail) {
            console.error('Invalid event or no detail object in event:', event);
            return;
        }

        const { itemId, item } = event.detail;
        console.log(`Selected checklist: ${itemId}`, item);

        if (!itemId || !item) {
            console.error(
                'Missing itemId or item in event detail:',
                event.detail
            );
            return;
        }

        try {
            // Store the selected checklist data
            this.selectedChecklistId = itemId;
            this.selectedChecklist = item;

            // Show the detail view - this acts as a redirect
            this.showDetailView = true;

            // Log state for debugging
            console.log(
                'Detail view should now be visible:',
                this.showDetailView
            );
            console.log('Selected checklist data:', this.selectedChecklist);
        } catch (error) {
            console.error('Error in handleChecklistSelect:', error);
        }
    }

    // This will run after the detail page is rendered
    renderedCallback() {
        if (this.showDetailView && this.selectedChecklist) {
            console.log(
                'In renderedCallback, finding detail page component...'
            );
            const detailPage = this.template.querySelector(
                'c-checklist-detail-page'
            );
            if (detailPage) {
                console.log('Found detail page component, setting data...');
                try {
                    detailPage.setChecklistData(this.selectedChecklist);
                    console.log('Data successfully passed to detail page');
                } catch (error) {
                    console.error('Error setting checklist data:', error);
                }
            } else {
                console.warn('Detail page component not found in DOM');
            }
        }
    }

    // Handle the back button event from detail page
    handleBackToList() {
        console.log('Back button clicked, returning to list view');

        try {
            // Reset the detail view state
            this.showDetailView = false;
            this.selectedChecklistId = null;
            this.selectedChecklist = null;

            console.log(
                'View state reset - showDetailView:',
                this.showDetailView
            );
        } catch (error) {
            console.error('Error in handleBackToList:', error);
        }
    }

    // Handle edit item event from checklist component
    handleEditItem(event) {
        const { itemId, item } = event.detail;
        console.log(`Editing item: ${itemId}`, item);

        // Use connectivity status component for toast notification if available
        // In the real app, you would use a proper notification system
        // This is just for demo purposes
        this.showNotification(`Editing ${item.name}`, 'info');

        // In a real application, you would open an edit modal or navigate to an edit page
    }

    // Handle delete item event from checklist component
    handleDeleteItem(event) {
        const { itemId } = event.detail;
        console.log(`Deleting item: ${itemId}`);

        // In a real application, you would show a confirmation dialog
        // For this demo, we'll just remove the item from the array
        this.checklistItems = this.checklistItems.filter(
            (item) => item.id !== itemId
        );

        // Show notification
        this.showNotification('Item deleted successfully', 'success');
    }

    // Helper method to show notifications
    showNotification(message, variant) {
        // In a real app, you would use a proper notification system
        // For this demo, we'll just log to console
        console.log(`${variant.toUpperCase()}: ${message}`);

        // Dispatch a custom event that the parent app component can listen to
        this.dispatchEvent(
            new CustomEvent('notification', {
                bubbles: true,
                composed: true,
                detail: {
                    message,
                    variant
                }
            })
        );
    }
    handleOpenChecklistModal() {
        console.log('Opening checklist modal...');
        this.showChecklistModal = true;
    }

    handleCloseChecklistModal() {
        this.showChecklistModal = false;
    }

    // Handle view checklist event
    handleViewChecklist(event) {
        console.log('View checklist event received:', event.detail);

        if (!event.detail || !event.detail.itemId || !event.detail.item) {
            console.error('Invalid event detail received:', event.detail);
            return;
        }

        // Store the selected checklist ID and item data
        this.selectedChecklistId = event.detail.itemId;
        this.selectedChecklist = event.detail.item;

        console.log('Setting selectedChecklistId:', this.selectedChecklistId);
        console.log('Setting selectedChecklist:', this.selectedChecklist);

        // Switch to detail view
        this.showDetailView = true;

        console.log('Showing detail view:', this.showDetailView);
    }

    @api
    filterItems(searchTerm) {
        this.searchTerm = searchTerm;

        if (!searchTerm) {
            // If search term is empty, restore original items
            this.checklistItems = [...this.originalChecklistItems];

            // Update the checklist component with the filtered items
            this.updateChecklistItems();
            return;
        }

        // Filter items based on the search term
        this.checklistItems = this.originalChecklistItems.filter((item) => {
            // Search in name, status, category, and other relevant fields
            return (
                (item.name && item.name.toLowerCase().includes(searchTerm)) ||
                (item.status &&
                    item.status.toLowerCase().includes(searchTerm)) ||
                (item.category &&
                    item.category.toLowerCase().includes(searchTerm)) ||
                (item.customer &&
                    item.customer.toLowerCase().includes(searchTerm)) ||
                (item.createdBy &&
                    item.createdBy.toLowerCase().includes(searchTerm)) ||
                (item.lastModifiedBy &&
                    item.lastModifiedBy.toLowerCase().includes(searchTerm))
            );
        });

        // Update the checklist component with the filtered items
        this.updateChecklistItems();
    }

    // Helper method to update the checklist component with filtered items
    updateChecklistItems() {
        if (this.showListView) {
            const checklistComponent =
                this.template.querySelector('c-checklist');
            if (checklistComponent) {
                checklistComponent.items = this.checklistItems;
            }
        }
    }

    // Handle data loaded from API
    handleDataLoaded(event) {
        console.log('Data loaded from API:', event.detail.items);

        // Update the items array with the data from the API
        if (
            event.detail &&
            event.detail.items &&
            event.detail.items.length > 0
        ) {
            // Store the loaded data as the current items
            this.checklistItems = [...event.detail.items];

            // Also update the original items array used for filtering
            this.originalChecklistItems = [...event.detail.items];

            console.log(
                'Updated checklistItems and originalChecklistItems with API data'
            );
        }
    }

    handleSaveChecklist(event) {
        const checklistData = event.detail;
        console.log('Received checklist data to save:', checklistData);

        // Generate a unique ID for the new checklist
        const now = new Date();
        const newId = 'checklist-' + now.getTime();

        // Create a new checklist item with the received data
        const newChecklist = {
            id: newId,
            name: checklistData.name,
            status: checklistData.status,
            category: checklistData.categoryName,
            createdBy: 'Current User',
            lastModifiedBy: 'Current User',
            createdDate: now.toISOString(),
            lastModifiedDate: now.toISOString(),
            createdFor: checklistData.createdForName,
            description: checklistData.description,
            assessmentType: checklistData.assessmentTypeName,
            numberOfAssessment: checklistData.numberOfAssessments || 0
        };

        // Add the new checklist to the list
        this.checklistItems = [newChecklist, ...this.checklistItems];

        // Also update the original items array used for filtering
        this.originalChecklistItems = [
            newChecklist,
            ...this.originalChecklistItems
        ];

        // Show success notification
        this.showNotification(
            `Checklist "${checklistData.name}" created successfully`,
            'success'
        );
    }
}
