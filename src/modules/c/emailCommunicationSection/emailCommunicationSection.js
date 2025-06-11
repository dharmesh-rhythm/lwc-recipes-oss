import { LightningElement, api, track } from 'lwc';

export default class EmailCommunicationSection extends LightningElement {
    @api recordId;

    @track emails = [
        {
            id: '1',
            subject: 'Assessment 16-05 Notification',
            to: 'supplier@abcmanufacturing.com',
            direction: 'Outbound',
            status: 'Sent',
            date: '5/1/2025 09:30 AM'
        },
        {
            id: '2',
            subject: 'RE: Assessment 16-05 Notification',
            to: 'assessments@yourcompany.com',
            direction: 'Inbound',
            status: 'Read',
            date: '5/2/2025 11:15 AM'
        },
        {
            id: '3',
            subject: 'Assessment 16-05 Reminder',
            to: 'supplier@abcmanufacturing.com',
            direction: 'Outbound',
            status: 'Sent',
            date: '5/10/2025 10:00 AM'
        }
    ];

    get emailCount() {
        return this.emails.length;
    }

    handleRefresh() {
        // In a real app, this would refresh the email list from the backend
        console.log('Refreshing emails...');
    }
}
