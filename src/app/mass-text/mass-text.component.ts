import { Component, OnInit } from "@angular/core";

import { DataService } from "../data.service";
import { UserService } from "../user.service";
import { TextService, TextFilterOptions } from "../text.service";
import { InboundText, OutboundText } from "../../common/text";

import { Team } from "../../common/team";
import { Racer } from "../../common/racer";
import { MassTextEvent } from "../../common/event";

import * as moment from "moment";

@Component({
  selector: 'mass-text',
  templateUrl: './mass-text.component.pug',
  styleUrls: ['./mass-text.component.scss']
})
export class MassTextComponent implements OnInit {
  teams: Team[] = [];
  racers: Racer[] = [];

  racerToTeamMap = new WeakMap();
  sentTexts = new WeakMap();

  newMassTextKeyword: string = "";
  newMassTextTimeout: number = 30;
  newMassTextBody: string = "";

  ready = false;

  currentEvent = undefined;
  numberSent = 0;

  isSending = false;

  oldMassTexts = [];

  constructor(
    private dataService: DataService,
    private textService: TextService,
    private userService: UserService
  ) {
    
  }

  endMassTextEvent() {
    if (this.currentEvent) {
      this.currentEvent.endedBy = this.userService.getUserAction();
      this.dataService.updateEvent(this.currentEvent)
        .then(event => this.currentEvent = undefined)
    }
  }

  getActiveMassTextEvent() {
    this.dataService.getEvents()
    .then(events => events.filter(event => event instanceof MassTextEvent))
    .then((events: MassTextEvent[]) => {
      this.oldMassTexts = events.filter(event => event.endedBy);
      return events.filter(event => !event.endedBy)
    })
    .then(events => {
      this.currentEvent = events.length ? events[0] : undefined;
      this.ready = true;
    });
  }

  massSend() {
    let newMassTextEventProperties = {
      eventType: MassTextEvent.EVENT_TYPE,
      byUser: this.userService.getUserAction(),
      keyword: this.newMassTextKeyword,
      timeout: this.newMassTextTimeout,
      body: this.newMassTextBody
    }

    this.dataService.createEvent(newMassTextEventProperties)
    .then(event => {
      this.currentEvent = event;
    })

    this.isSending = true;
    this.racers.forEach(racer => {
      let number = racer.getPrimaryContactNumber().number;
      let message = this.getMessagePreview();
      this.textService.sendText(number, message)
        .then(text => {
          this.numberSent++;
          this.sentTexts.set(racer, text);
          if (this.numberSent == this.racers.length) {
            this.isSending = false;
          }
        });
    });
  }

  getProgressBarValue() {
    return this.numberSent / this.racers.length;
  }
  
  getMessagePreview() {
    return `Race2 Alert - ${this.newMassTextBody} - Your team MUST respond "${this.newMassTextKeyword}" within ${this.newMassTextTimeout} minutes!`;
  }

  getSentMessage() {
    return `Race2 Alert - ${this.currentEvent.body} - Your team MUST respond "${this.currentEvent.keyword}" within ${this.currentEvent.timeout} minutes!`;
  }

  getTeamForRacer(racer: Racer) {
    return this.racerToTeamMap.get(racer);
  }

  getMostRecentReceivedTextForRacer(racer: Racer) {
    let textSentTime = this.currentEvent.byUser.timestamp;
    let opts = {
      racer: racer,
      inbound: true,
      outbound: false,
      afterTime: textSentTime
    };
    let filterOptions = new TextFilterOptions(opts);
    let matchingTexts = this.textService.getTextsFiltered(filterOptions);
    let sorted = matchingTexts.sort((t1, t2) => moment(t2.timestamp).diff(moment(t1.timestamp)));
    if (matchingTexts.length) {
      return sorted[0];
    }
  }

  getTextResponseTimeForRacer(racer: Racer) {
    if (this.hasRacerResponded(racer)) {
      let mostRecentResponse = this.getMostRecentReceivedTextForRacer(racer);
      if (mostRecentResponse) {
        return mostRecentResponse.timestamp;
      }
    }
  }

  getTextResponseTextForRacer(racer: Racer) {
    if (this.hasRacerResponded(racer)) {
      let mostRecentResponse = this.getMostRecentReceivedTextForRacer(racer);
      if (mostRecentResponse) {
        return mostRecentResponse.body;
      }
    }
  }

  hasRacerResponded(racer: Racer) {
    let mostRecentResponse = this.getMostRecentReceivedTextForRacer(racer);
    if (!mostRecentResponse) {
      return;
    }

    if (mostRecentResponse.body.indexOf(this.currentEvent.keyword) != -1) {
      return mostRecentResponse;
    }
  }

  getRacerRowClass(racer: Racer) {
    if (this.hasRacerResponded(racer)) {
      return "responded";
    } else {
      return "not-responded";
    }
  }

  ngOnInit() {
    this.getActiveMassTextEvent();
    this.dataService.getTeamsFromBackend()
    .then(teams => {
      this.teams = teams;
      this.teams.forEach(team => {
        this.racers = this.racers.concat(team.racers);
        team.racers.forEach(racer => {
          this.racerToTeamMap.set(racer, team);
        });
      });
    })
    let onTextsChanged = (texts) => {
      console.log('texts changed/received!');
    }
    this.textService.addTextsChangedCallback(onTextsChanged);
    this.textService.addTextReceivedCallback(onTextsChanged);
  }
}
