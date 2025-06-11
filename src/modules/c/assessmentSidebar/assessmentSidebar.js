import { LightningElement, track } from 'lwc';

export default class AssessmentSidebar extends LightningElement {
    @track selectedTab = 'create'; // Default to 'create' tab

    // Set initial active state when component is inserted into DOM
    connectedCallback() {
        // Set default tab to 'create'
        this.selectedTab = 'create';

        // The active class and event firing will be handled in renderedCallback
    }

    selectCreateTab() {
        this.selectedTab = 'create';
        // Update tab styling
        this.updateActiveTabClass();
        // Fire event to parent
        this.fireTabChangeEvent('create');
    }

    selectManageTab() {
        this.selectedTab = 'manage';
        // Update tab styling
        this.updateActiveTabClass();
        // Fire event to parent
        this.fireTabChangeEvent('manage');
    }

    // Method to update the active class on the tabs
    updateActiveTabClass() {
        console.log('Setting active tab to:', this.selectedTab);

        // Find all tab elements
        const tabs = this.template.querySelectorAll('.sidebar-tab');

        // Remove active class from all tabs
        tabs.forEach((tab) => {
            tab.classList.remove('active');
        });

        // Add active class to the selected tab
        const selectedTabElement = this.template.querySelector(
            `.sidebar-tab[data-tab="${this.selectedTab}"]`
        );
        if (selectedTabElement) {
            console.log('Found tab element, adding active class');
            selectedTabElement.classList.add('active');

            // Also update the icon and label styles
            const icon = selectedTabElement.querySelector('.tab-icon svg');
            if (icon) {
                icon.style.fill = 'white';
            }

            const label = selectedTabElement.querySelector('.tab-label');
            if (label) {
                label.style.color = 'white';
                label.style.fontWeight = '600';
            }
        } else {
            console.log(
                'Could not find element with data-tab:',
                this.selectedTab
            );
        }
    }

    fireTabChangeEvent(tabName) {
        // Create and dispatch custom event
        const event = new CustomEvent('selectedtabchange', {
            detail: tabName
        });
        this.dispatchEvent(event);
    }
}
