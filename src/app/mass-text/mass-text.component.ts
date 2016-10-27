import { Component, OnInit } from "@angular/core";

import { DataService } from "../data.service";
import { TextService, TextFilterOptions } from "../text.service";
import { InboundText, OutboundText } from "../../common/text";

import { Team } from "../../common/team";
import { Racer } from "../../common/racer";

import * as moment from "moment";

@Component({
  selector: 'mass-text',
  templateUrl: './mass-text.component.html',
  styleUrls: ['./mass-text.component.scss']
})
export class MassTextComponent implements OnInit {
  teams: Team[] = [];
  racers: Racer[] = [];

  racerToTeamMap = new WeakMap();
  sentTexts = new WeakMap();

  massTextKeyword: string = "";
  massTextTimeout: number = 30;
  massTextBody: string = "";

  sentMassText = undefined;

  constructor(
    private dataService: DataService,
    private textService: TextService
  ) {
    
  }

  massSend() {
    this.sentMassText = {
      keyword: this.massTextKeyword,
      timeout: this.massTextTimeout,
      body: this.massTextBody,
      numberSent: 0
    }
    this.racers.forEach(racer => {
      let number = racer.getPrimaryContactNumber().number;
      let message = this.getMessagePreview();
      this.textService.sendText(number, message)
        .then(text => {
          this.sentMassText.numberSent++;
          this.sentTexts.set(racer, text);
        });
    });
  }
  
  getMessagePreview() {
    return `Race2 Alert - ${this.massTextBody} - Your team MUST respond "${this.massTextKeyword}" within ${this.massTextTimeout} minutes!`;
  }

  getTeamForRacer(racer: Racer) {
    return this.racerToTeamMap.get(racer);
  }

  getMostRecentReceivedTextForRacer(racer: Racer) {
    let textSentTime = this.getTextSentTimeForRacer(racer);
    let opts = {
      racer: racer,
      inbound: true,
      outbound: false,
      afterTime: textSentTime
    };
    let filterOptions = new TextFilterOptions(opts);
    let matchingTexts = this.textService.getTextsFiltered(filterOptions);
    let sorted = matchingTexts.sort((t1, t2) => moment(t2.timestamp).diff(t1.timestamp));
    if (matchingTexts.length) {
      return sorted[0];
    } else {
      return null;
    }
  }

  getTextSentTimeForRacer(racer: Racer) {
    let sentText = this.sentTexts.get(racer);
    if (sentText) {
      return sentText.timestamp;
    } else {
      return undefined;
    }
  }

  getTextResponseTimeForRacer(racer: Racer) {
    let mostRecentResponse = this.getMostRecentReceivedTextForRacer(racer);
    if (mostRecentResponse) {
      return mostRecentResponse.timestamp;
    }
  }

  getTextResponseTextForRacer(racer: Racer) {
    let mostRecentResponse = this.getMostRecentReceivedTextForRacer(racer);
    if (mostRecentResponse) {
      return mostRecentResponse.body;
    }
  }

  getRacerResponded(racer: Racer) {
    let mostRecentResponse = this.getMostRecentReceivedTextForRacer(racer);
    if (!mostRecentResponse) {
      return false;
    }

    if (mostRecentResponse.body == this.sentMassText.body) {
      return true;
    } else {
      return false;
    }
  }

  getRacerRowClass(racer: Racer) {
    if (this.getRacerResponded(racer)) {
      return "responded";
    } else {
      return "not-responded";
    }
  }

  ngOnInit() {
    this.dataService.getTeams()
      .then(teams => {
        this.teams = teams;
        this.teams.forEach(team => {
          this.racers = this.racers.concat(team.racers);
          this.racers.forEach(racer => {
            this.racerToTeamMap.set(racer, team);
          });
        });
      });
    let onTextsChanged = (texts) => {
      console.log('texts changed/received!');
    }
    this.textService.addTextsChangedCallback(onTextsChanged);
    this.textService.addTextReceivedCallback(onTextsChanged);
  }
}
