import { LightningElement, api } from 'lwc';
import { reduceErrors } from 'c/utils';

export default class ErrorPanel extends LightningElement {
    /** Single or array of errors */
    @api errors;
    /** Generic / user-friendly message */
    @api friendlyMessage = 'Error retrieving data';

    viewDetails = false;

    get errorMessages() {
        return reduceErrors(this.errors);
    }

    get detailsButtonLabel() {
        return this.viewDetails ? 'Hide Details' : 'Show Details';
    }

    handleShowDetailsClick() {
        this.viewDetails = !this.viewDetails;
    }
}
