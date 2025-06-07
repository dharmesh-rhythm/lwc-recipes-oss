import { LightningElement } from 'lwc';

export default class Index extends LightningElement {
    // This component now just acts as a container for our CRM app
    connectedCallback() {
        console.log('index.js loaded');
    }
}
