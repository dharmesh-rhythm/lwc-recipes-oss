import { LightningElement, api, track } from 'lwc';

export default class AssignSection extends LightningElement {
    @api recordId;
    @track assignmentScope = 'All Suppliers';

    // Multi-select functionality properties
    @track selectedScope = '';
    @track showItemSelection = false;
    @track availableItems = [];
    @track selectedItems = [];
    @track allItems = {
        'All Suppliers': [
            {
                id: 'sup1',
                name: 'Alpha Components Ltd.',
                address: '123 Industrial Lane, Pune, Maharashtra',
                date: '2024-01-12',
                selected: false
            },
            {
                id: 'sup2',
                name: 'BrightStar Industries',
                address: '456 Export Park, Noida, Uttar Pradesh',
                date: '2024-02-18',
                selected: false
            },
            {
                id: 'sup3',
                name: 'Quantum Manufacturing Co.',
                address: '789 Omega St, Bengaluru, Karnataka',
                date: '2024-03-10',
                selected: false
            },
            {
                id: 'sup4',
                name: 'Fusion Materials Pvt. Ltd.',
                address: '321 Tech Avenue, Hyderabad, Telangana',
                date: '2024-04-05',
                selected: false
            },
            {
                id: 'sup5',
                name: 'Vertex Supplies',
                address: '654 Industrial Area Phase II, Chandigarh',
                date: '2024-05-20',
                selected: false
            }
        ],
        Customer: [
            {
                id: 'cus1',
                name: 'Acme Corp',
                address: '100 Summit Tower, Mumbai, Maharashtra',
                date: '2024-01-25',
                selected: false
            },
            {
                id: 'cus2',
                name: 'Nimbus Retailers',
                address: '200 Galaxy Mall, Ahmedabad, Gujarat',
                date: '2024-02-11',
                selected: false
            },
            {
                id: 'cus3',
                name: 'Zenith Group',
                address: '300 Cloudview Plaza, Jaipur, Rajasthan',
                date: '2024-03-08',
                selected: false
            },
            {
                id: 'cus4',
                name: 'Trident Enterprises',
                address: '400 Oceanic Square, Kolkata, West Bengal',
                date: '2024-04-23',
                selected: false
            }
        ],
        Location: [
            {
                id: 'loc1',
                name: 'Logistics Hub – North',
                address: '1 Logistics Way, Gurugram, Haryana',
                date: '2024-01-30',
                selected: false
            },
            {
                id: 'loc2',
                name: 'Distribution Center – West',
                address: '2 Supply Lane, Navi Mumbai, Maharashtra',
                date: '2024-02-17',
                selected: false
            },
            {
                id: 'loc3',
                name: 'Warehouse – Central',
                address: '3 Storage Blvd, Bhopal, Madhya Pradesh',
                date: '2024-03-22',
                selected: false
            },
            {
                id: 'loc4',
                name: 'Operations Base – South',
                address: '4 Service Road, Coimbatore, Tamil Nadu',
                date: '2024-04-15',
                selected: false
            }
        ]
    };

    // Initialize the dropdown when component is connected
    renderedCallback() {
        const selectElement = this.template.querySelector('#scope-select');
        if (selectElement) {
            // Set the selected value based on assignmentScope
            selectElement.value = this.assignmentScope;
        }
    }

    @track suppliers = [
        {
            id: 'supplier1',
            name: 'Zyod',
            address: 'New York, USA',
            dateAdded: '05/28/2025'
        },
        {
            id: 'supplier2',
            name: 'Star Logistics',
            address: 'Chicago, USA',
            dateAdded: '05/28/2025'
        },
        {
            id: 'supplier3',
            name: 'Star Refrigeration',
            address: 'San Francisco, USA',
            dateAdded: '05/28/2025'
        },
        {
            id: 'supplier4',
            name: 'Starrag',
            address: 'Seattle, USA',
            dateAdded: '05/28/2025'
        },
        {
            id: 'supplier5',
            name: 'Starry Group',
            address: 'Boston, USA',
            dateAdded: '05/28/2025'
        },
        {
            id: 'supplier6',
            name: 'State Research Institute of Aviation Systems',
            address: 'Los Angeles, USA',
            dateAdded: '05/28/2025'
        },
        {
            id: 'supplier7',
            name: 'State Space Agency of Ukraine',
            address: 'Kyiv, Ukraine',
            dateAdded: '05/28/2025'
        },
        {
            id: 'supplier8',
            name: 'STAUFF',
            address: 'Berlin, Germany',
            dateAdded: '05/28/2025'
        }
    ];

    @track sortDirection = 'asc';
    @track sortedBy = 'name';

    // Dynamic count for suppliers
    get suppliersCount() {
        return this.suppliers.length;
    }

    scopeOptions = [
        { label: 'All Suppliers', value: 'All Suppliers' },
        { label: 'North America Suppliers', value: 'North America Suppliers' },
        { label: 'Europe Suppliers', value: 'Europe Suppliers' },
        { label: 'Asia Suppliers', value: 'Asia Suppliers' }
    ];

    handleScopeChange(event) {
        this.assignmentScope = event.target.value;
        console.log('Selected scope:', event.target.value);

        // Add multi-select functionality
        this.selectedScope = event.target.value;
        this.showItemSelection = this.selectedScope !== '';

        if (this.showItemSelection) {
            this.availableItems = JSON.parse(
                JSON.stringify(this.allItems[this.selectedScope])
            );
            this.updateSelectedItems();
        } else {
            this.availableItems = [];
            this.selectedItems = [];
        }
    }

    handleRowSelection(event) {
        // Handle row selection
        const selectedRows = event.detail.selectedRows;
        console.log('Selected rows:', selectedRows);
    }

    sortByName() {
        this.sortData('name');
    }

    sortByAddress() {
        this.sortData('address');
    }

    sortByDate() {
        this.sortData('dateAdded');
    }

    sortData(field) {
        // If same field is clicked, reverse the direction
        if (this.sortedBy === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortedBy = field;
            this.sortDirection = 'asc';
        }

        // Create a copy of the array to sort
        let sortedData = [...this.suppliers];

        // Sort the array
        sortedData.sort((a, b) => {
            let valueA = a[field] ? a[field].toLowerCase() : '';
            let valueB = b[field] ? b[field].toLowerCase() : '';

            let result = 0;
            if (valueA > valueB) {
                result = 1;
            }
            if (valueA < valueB) {
                result = -1;
            }

            // If descending, reverse the result
            return this.sortDirection === 'asc' ? result : -result;
        });

        // Update the suppliers array
        this.suppliers = sortedData;
    }

    // New methods for multi-select functionality
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        if (this.selectedScope) {
            if (searchTerm) {
                const allScopeItems = JSON.parse(
                    JSON.stringify(this.allItems[this.selectedScope])
                );
                this.availableItems = allScopeItems.filter((item) =>
                    item.name.toLowerCase().includes(searchTerm)
                );
            } else {
                this.availableItems = JSON.parse(
                    JSON.stringify(this.allItems[this.selectedScope])
                );
            }
            this.availableItems.forEach((item) => {
                const selectedItem = this.selectedItems.find(
                    (selected) => selected.id === item.id
                );
                if (selectedItem) {
                    item.selected = true;
                }
            });
        }
    }

    handleItemSelection(event) {
        const itemId = event.target.dataset.id;
        const isChecked = event.target.checked;
        const itemIndex = this.availableItems.findIndex(
            (item) => item.id === itemId
        );
        if (itemIndex !== -1) {
            this.availableItems[itemIndex].selected = isChecked;
        }
        const itemInAll = this.allItems[this.selectedScope].find(
            (item) => item.id === itemId
        );
        if (itemInAll) {
            itemInAll.selected = isChecked;
        }
        this.updateSelectedItems();
    }

    updateSelectedItems() {
        this.selectedItems = this.availableItems.filter(
            (item) => item.selected
        );
    }

    // Handle Save button - show selected items in table
    handleSave() {
        console.log('Save clicked - Selected items:', this.selectedItems);

        // Update the suppliers table with selected items
        if (this.selectedItems.length > 0) {
            // Map selected items to supplier format
            const selectedSuppliers = this.selectedItems.map((item) => ({
                id: item.id,
                name: item.name,
                address: item.address || 'N/A',
                dateAdded: item.date || new Date().toLocaleDateString()
            }));

            // Replace or append to suppliers array based on your requirement
            this.suppliers = selectedSuppliers;
        }

        // Close the multi-select component
        this.showItemSelection = false;
        this.selectedScope = '';
    }

    // Handle Cancel button - close and deselect
    handleCancel() {
        console.log('Cancel clicked');

        // Reset all selections
        if (this.selectedScope && this.allItems[this.selectedScope]) {
            this.allItems[this.selectedScope].forEach((item) => {
                item.selected = false;
            });
        }

        // Clear current state
        this.availableItems = [];
        this.selectedItems = [];
        this.showItemSelection = false;
        this.selectedScope = '';

        // Reset the dropdown to default
        const selectElement = this.template.querySelector('#scope-select');
        if (selectElement) {
            selectElement.value = '';
        }
    }
}
