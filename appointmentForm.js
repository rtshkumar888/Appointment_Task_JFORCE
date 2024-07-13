import { LightningElement,wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getContacts from '@salesforce/apex/AppointmentBook.getContacts';
import getAppSlot from '@salesforce/apex/AppointmentBook.getAppointmentSlots';
export default class AppointmentForm extends LightningElement {
    contact;
    subject;
    date;
    time;
    description;
    searchTerm;
    contactList = [];
    contactsFound = false;
    conSelectedId;

    slotPresent = false;
    slotList = [];



    /*@wire(getAppSlot,{dt:this.date, tm:this.time})
    recordsOfSlots({data,error}){
        if(data){
            this.slotList=data;
        }else if(error){
            console.log('ERROR: Slots');
        }
    }*/

    @wire(getContacts, { searchTerm: '$searchTerm' })
    recordsOfContacts({ data, error }) {
        if (data) {
            this.contactsFound = true;
            this.contactList = data;

            console.log('contactList::: ', this.contactList);
            console.log('JSON.Stringify(this.contactList):::: ', JSON.stringify(this.contactList));
        } else if (error) {
            console.log('ERROR:: ', error.body.message);
        }
    }

    handleContactChange(event) {
        console.log(event.target.value);
        this.searchTerm = event.target.value;
    
    }

    handleSelectedRecord(event) {

        this.conSelectedId = event.currentTarget.dataset.id;
        console.log('Con Selected Id:: ', this.conSelectedId);
        this.searchTerm1 = this.contactList.find((item) => {
            if (item.Id === this.conSelectedId) {
                console.log('True');
                return true;
            } else {
                console.log('False ', item.Id, '', this.conSelectedId);
                return false;
            }
        });
        console.log('this.searchTerm1:::', this.searchTerm1);
        // this.searchTerm=this.searchTerm1.Name;
        this.template.querySelector('lightning-input').value = this.searchTerm1.Name;
        console.log('this.searchTerm::: ', this.searchTerm);

        this.contactsFound = false;
    }


    handleFocus() {
        // Open the contact dropdown when the input gains focus
        this.contactsFound = true;
    }


    
    handleSubjectChange(event) {
        console.log(event.target.value);
        this.subject = event.target.value;
    }
    handleDateTimeChange(event) {
        console.log(event.target.value);
        this.date = event.target.value;
        console.log("Date:: ", this.date);
        const dt = new Date(event.target.value);
        this.time = dt.toISOString().split('T')[1].split('.')[0]; // Remove milliseconds

        console.log("Time:", this.time);
    }
    handleDescriptionChange(event) {
        this.description = event.target.value;
    }
    bookAppointment() {

        const fields = {
            'Description__c': this.description, 'Subject__c': this.subject,
            'Appointment_Date__c': this.date, 'Appointment_Time__c': this.time,
            'Contact__c': this.conSelectedId

        };
        console.log(JSON.stringify(fields));

        const recordToCreate = { apiName: 'Appointment_Detail__c', fields };
        createRecord(recordToCreate).then(response => {


            this.resetFieldValues();

            console.log('Record Inserted Successfully.');
            this.showToast('SUCCESS', 'Record created successfully!!', 'success');

        }).catch((error) => {
            console.log(error.body.message);
            this.showToast('ERROR', 'Something went wrong!', 'error');

        })

    }

    showToast(title, message, variant) {
        const toast = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toast);
    }

    checkAvailability() {
        console.log('Data Type of time ', typeof this.time);
        console.log('Data type of date ', typeof this.date);
        getAppSlot({ dt: this.date })
            .then(response => {
                this.slotList = response;
                console.log('this.slotList:::: ', this.slotList);
                if (this.slotList.length > 0) {
                    this.slotPresent = true;
                } else {
                    this.slotPresent = false;
                }
            }).catch(error => {
                this.showToast('ERROR', 'Please Select Date/Time!', error);
            })
    }



    resetFieldValues() {
        const inputLists = this.template.querySelectorAll('lightning-input');
        inputLists.forEach(element => {
            element.value = '';
        });
        this.template.querySelector('lightning-textarea').value = '';


        this.description = undefined;
        this.subject = undefined;
        this.slotPresent = false;
        this.searchTerm = undefined;
    }
}