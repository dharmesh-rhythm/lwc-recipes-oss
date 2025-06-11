import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {
    // This component now just acts as a container for our CRM app
    @track isLoggedIn = false;
    handleLogin(event) {
        console.log('login', event.detail);
        this.isLoggedIn = event.detail.success;
    }
}
