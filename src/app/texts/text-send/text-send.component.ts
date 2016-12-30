import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import { Racer } from '../../../common/racer';
import { Text, PhoneNumber } from '../../../common/text';

import { TextService } from '../../text.service';
import { DataService } from '../../data.service';

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
  matchingRecipients = [];
  allRecipients = [];
  newRecipient = "";

  filterRecipients() {
    let search = this.newRecipient.toLowerCase();
    this.matchingRecipients = this.allRecipients.filter(recipient => {
      console.log('checking search', search, 'against recipient', recipient);
      return (recipient.name.toLowerCase().indexOf(search) != -1
        || recipient.number.indexOf(search) != -1)
        && this.recipients.filter(r => r.number == recipient.number).length == 0;
    });
    console.log(this.allRecipients);
    console.log(this.matchingRecipients);
  }

  addRecipient(recipient) {
    this.recipients.push(recipient);
    this.newRecipient = "";
    this.filterRecipients();
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
      let contacts = racer.phones.map(contact => {
        console.log(racer, contact);
        return {
          name: racer.name,
          numNote: contact.notes || "",
          number: contact.number
        }
      });
      allContacts = allContacts.concat(contacts);
    });
    this.allRecipients = allContacts;
    this.recipients = this.allRecipients.filter(recipient => recipient.number == this.toNumber);
    if (!this.recipients.length) {
      this.recipients.push({
        name: '?',
        numNote: '?',
        number: this.toNumber
      })
    }
  }
}
