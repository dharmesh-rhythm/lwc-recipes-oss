import { LightningElement, api } from 'lwc';

export default class AssessmentBanner extends LightningElement {
    @api title = 'Assessment 16-05';
    @api label = 'ASSESSMENTS';

    handleDeleteClick() {
        this.dispatchEvent(new CustomEvent('delete'));
    }
}
