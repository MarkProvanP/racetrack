import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

import { DataService } from '../../../data.service';

import { Text, ContactNumber } from '../../../../common/text';
import { Racer } from '../../../../common/racer';

@Component({
  selector: 'unknown-text',
  templateUrl: './unknown-text.template.html',
  styleUrls: ['./unknown-text.style.scss']
})
export class UnknownTextComponent implements OnInit {
  @Input() text: Text;
  @Input() display: any;
  @Output() onMakeRead: EventEmitter = new EventEmitter();
  @Output() onCreateReply: EventEmitter = new EventEmitter();
  inLinkingMode: boolean = false;
  racersList: Racer[] = [];
  selectedRacer: Racer;
  newContact: ContactNumber = {
    number: undefined,
    name: undefined,
    notes: undefined,
    preferred: false
  };

  ngOnInit() {
    this.newContact.number = this.text.from;
  }

  constructor(private dataService: DataService) {

  }

  linkUnknownTextToRacer() {
    this.inLinkingMode = true;
    this.dataService.getRacers()
      .then(racers => {
        this.racersList = racers;
      })
  }

  saveNumberToRacer() {
    this.selectedRacer.phones.push(this.newContact);
    this.dataService.updateRacer(this.selectedRacer)
      .then(racer => {
        this.selectedRacer = racer;
        this.finishLinking();
      })
  }

  finishLinking() {
    this.inLinkingMode = false;
  }

  markTextAsRead() {
    this.onMakeRead.emit(this.text);
  }

  replyToText() {
    this.onCreateReply.emit(this.text);
  }

  pickRacer(racer: Racer) {
    this.selectedRacer = racer;
  }
}
