import { LightningElement, track } from 'lwc';

export default class Navigation extends LightningElement {
    @track selectedItem = 'accounts'; // Default selected item

    get accountItemClass() {
        return this.selectedItem === 'accounts'
            ? 'slds-nav-vertical__item slds-is-active'
            : 'slds-nav-vertical__item';
    }

    get contactItemClass() {
        return this.selectedItem === 'contacts'
            ? 'slds-nav-vertical__item slds-is-active'
            : 'slds-nav-vertical__item';
    }

    handleAccountsClick(event) {
        event.preventDefault();
        this.selectedItem = 'accounts';
        this.dispatchNavigationEvent('accounts');
    }

    handleContactsClick(event) {
        event.preventDefault();
        this.selectedItem = 'contacts';
        this.dispatchNavigationEvent('contacts');
    }

    dispatchNavigationEvent(selectedItem) {
        const navigationEvent = new CustomEvent('navigate', {
            detail: { view: selectedItem }
        });
        this.dispatchEvent(navigationEvent);
    }
}
