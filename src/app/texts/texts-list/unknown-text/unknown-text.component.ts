import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

import { DataService } from '../../../data.service';
import { UserService } from '../../../user.service';

import { Text, InboundText, OutboundText, ContactNumber } from '../../../../common/text';
import { UserActionInfo } from "../../../../common/user";
import { Racer } from '../../../../common/racer';

@Component({
  selector: 'unknown-text',
  templateUrl: './unknown-text.component.pug',
  styleUrls: ['./unknown-text.component.scss']
})
export class UnknownTextComponent implements OnInit {
  @Input() text: InboundText;
  @Input() display: any;
  @Output() onMakeRead: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCreateReply: EventEmitter<any> = new EventEmitter<any>();
  inLinkingMode: boolean = false;
  racersList: Racer[] = [];
  selectedRacer: Racer;
  newContact: ContactNumber = {
    number: undefined,
    notes: undefined,
    preferred: true 
  };

  ngOnInit() {
    this.newContact.number = this.text.from;
  }

  constructor(
    private dataService: DataService,
    private userService: UserService
  ) {
  }

  linkUnknownTextToRacer() {
    this.inLinkingMode = true;
    this.racersList = this.dataService.getRacers();
  }

  saveNumberToRacer() {
    this.selectedRacer.phones.push(this.newContact);
    this.dataService.updateRacerAndWriteToBackend(this.selectedRacer)
      .then(racer => {
        this.selectedRacer = racer;
        this.finishLinking();
      })
  }

  finishLinking() {
    this.inLinkingMode = false;
  }

  markTextAsRead() {
    (<InboundText> this.text).readBy = this.userService.getUserAction();
    this.onMakeRead.emit(this.text);
  }

  replyToText() {
    this.onCreateReply.emit(this.text);
  }

  pickRacer(racer: Racer) {
    this.selectedRacer = racer;
  }
}
