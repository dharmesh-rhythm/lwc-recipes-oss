import { LightningElement, api } from 'lwc';

export default class AssessmentDetails extends LightningElement {
    @api recordId;
    @api selectedSidebarTab = 'create'; // Default to 'create' sidebar tab
    _selectedTab = 'define'; // Default to 'define' subtab
    svgPath = '/assets/icons/utility-sprite/svg/symbols.svg';

    // Use setter and getter for selectedTab to allow changes from parent component
    @api
    get selectedTab() {
        return this._selectedTab;
    }

    set selectedTab(value) {
        this._selectedTab = value;
    }

    renderedCallback() {
        this.updateSvgIcons();
    }

    updateSvgIcons() {
        const svgs = this.template.querySelectorAll('use');
        svgs.forEach((svg) => {
            // Example - adjust based on your actual implementation
            svg.setAttribute('xlink:href', this.svgPath);
        });
    }
    // Get the class for a tab based on whether it's active
    getTabClass(tabName) {
        return this._selectedTab === tabName
            ? 'modern-tab active'
            : 'modern-tab';
    }

    // Get the class for a card tab based on whether it's active
    getCardTabClass(tabName) {
        return this._selectedTab === tabName ? 'card-tab active' : 'card-tab';
    }

    // Sidebar tab getters
    get isCreateSidebarTab() {
        return this.selectedSidebarTab === 'create';
    }

    get isManageSidebarTab() {
        return this.selectedSidebarTab === 'manage';
    }

    // Subtab getters
    get isDefineTab() {
        return this._selectedTab === 'define' && this.isCreateSidebarTab;
    }

    get isAssignTab() {
        return this._selectedTab === 'assign' && this.isCreateSidebarTab;
    }

    get isResponseTab() {
        return this._selectedTab === 'response' && this.isManageSidebarTab;
    }

    get isFindingTab() {
        return this._selectedTab === 'finding' && this.isManageSidebarTab;
    }

    get isEmailTab() {
        return this._selectedTab === 'email' && this.isManageSidebarTab;
    }

    // Tab selection handlers
    selectDefine() {
        this._selectedTab = 'define';
    }

    selectAssign() {
        this._selectedTab = 'assign';
    }

    selectReview() {
        this._selectedTab = 'response';
    }

    selectFinding() {
        this._selectedTab = 'finding';
    }

    selectEmail() {
        this._selectedTab = 'email';
    }
}
