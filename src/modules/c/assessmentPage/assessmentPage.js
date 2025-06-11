import { api, LightningElement, track } from 'lwc';

export default class AssessmentPage extends LightningElement {
    @api recordId;
    @track selectedSidebarTab = 'create'; // Default to 'create' tab
    @track selectedTab = 'define'; // Default subtab

    // Handle sidebar tab change
    handleTabChange(event) {
        this.selectedSidebarTab = event.detail;

        if (this.selectedSidebarTab === 'create') {
            this.selectedTab = 'define';
        } else if (this.selectedSidebarTab === 'manage') {
            this.selectedTab = 'response';
        }

        const detailsComponent = this.template.querySelector(
            'ui-assessment-details'
        );
        if (detailsComponent) {
            detailsComponent.selectedTab = this.selectedTab;
        }
    }

    // Handle delete button click in banner
    handleDelete() {
        console.log('Delete button clicked');
    }
}
