import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import { Racer } from '../../../common/racer';
import { Text, PhoneNumber } from '../../../common/text';

import { TextService } from '../../text.service';
import { DataService } from '../../data.service';

class Recipient {
  constructor(
    public name: string,
    public numNote: string,
    public number: PhoneNumber
  ) {}

  matchesName(name: string) {
    return this.name.toLowerCase().indexOf(name) != -1;
  }

  matchesNumber(numberString: string) {
    if (!this.number) {
      return false;
    }
    return this.number.toE164().indexOf(numberString) != -1;
  }

  hasPhoneNumber(phoneNumber: PhoneNumber) {
    if (!this.number) {
      return false;
    }
    return this.number.equals(phoneNumber)
  }
}

@Component({
  selector: 'text-send',
  templateUrl: './text-send.component.pug',
  styleUrls: ['./text-send.component.scss']
})
export class TextSendComponent {
  @Input() toRacer: Racer;
  @Output() onTextSendClose = new EventEmitter();
  @Input() toNumber: PhoneNumber;
  message: string;
  isSending = false;
  recipients = [];
  matchingRecipients: Recipient[] = [];
  allRecipients: Recipient[] = [];
  searchQuery = "";
  editingRecipients: boolean;

  filterRecipients() {
    let search = this.searchQuery.toLowerCase();
    console.log(this.allRecipients);
    console.log(this.matchingRecipients);
    this.matchingRecipients = this.allRecipients.filter(recipient => {
      console.log('checking search', search, 'against recipient', recipient);
      return recipient.matchesName(this.searchQuery)
        || recipient.matchesNumber(this.searchQuery)
        && (this.recipients.filter(r => r.hasPhoneNumber(recipient.number)).length == 0);
    });
    console.log(this.matchingRecipients);
  }

  toggleEditingRecipients() {
    this.editingRecipients = !this.editingRecipients;
  }

  addRecipient(recipient: Recipient) {
    this.recipients.push(recipient);
    this.searchQuery = "";
    this.filterRecipients();
  }

  removeRecipient(recipient: Recipient) {
    let index = this.recipients.indexOf(recipient);
    this.recipients.splice(index, 1);
  }

  constructor(
    private textService: TextService,
    private dataService: DataService
  ) {}

  sendNewText() {
    this.isSending = true;
    this.recipients.forEach(recipient => {
      this.textService.sendText(recipient.number, this.message)
        .then(response => {
          this.isSending = false;
          this.onTextSendClose.emit();
        });
    });
  }

  cancelNewText() {
    this.onTextSendClose.emit();
  }

  ngOnInit() {
    let racers = this.dataService.getRacers()
    let allContacts = [];
    racers.forEach(racer => {
      let contacts = racer.phones.map(contact => new Recipient(racer.name, contact.notes || "", contact.number));
      allContacts = allContacts.concat(contacts);
    });
    this.allRecipients = allContacts;
    this.recipients = this.allRecipients.filter(recipient => recipient.hasPhoneNumber(this.toNumber));
    if (!this.recipients.length) {
      this.recipients.push(new Recipient('?', '?', this.toNumber))
    }
  }
}
