import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

import { DataService } from '../../../data.service';
import { UserService } from '../../../user.service';

import { Text, ContactNumber, UserActionInfo } from '../../../../common/text';
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

  constructor(
    private dataService: DataService,
    private userService: UserService
  ) {
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
    let user = this.userService.getUser();
    let textRead = {
      timestamp: new Date(),
      user: user
    } as UserActionInfo;
    this.text.readBy = textRead;
    this.onMakeRead.emit(this.text);
  }

  replyToText() {
    this.onCreateReply.emit(this.text);
  }

  pickRacer(racer: Racer) {
    this.selectedRacer = racer;
  }
}
