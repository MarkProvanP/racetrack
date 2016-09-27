import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text } from '../../../common/text';
import { DataService } from '../../data.service';

import * as moment from "moment";

@Component({
  selector: "racer-texts",
  templateUrl: "./racer-texts.template.html",
  styleUrls: ["./racer-texts.styles.scss"]
})
export class RacerTextsComponent implements OnInit {
  @Input() texts: [Text];
  racers: [Racer];
  selectedRacer: Racer;
  selectedRacerTexts: [Text];

  constructor(private dataService: DataService) {};
  getTexts(): void {
    this.dataService.getTexts()
      .then(texts => {
        this.texts = texts.reverse();
        this.texts.forEach(text => this.addRacerToText(text));
      });
  }

  addRacerToText(text) {
    this.dataService.getRacerForPhoneNumber(text.from)
      .then(racer => {
        text.racer = racer
        this.dataService.getTeamForRacer(racer)
          .then(team => text.team = team);
      });
  }

  getRacers(): void {
    this.dataService.getRacers()
      .then(racers => {
        this.racers = racers;
      });
  }

  selectTextsByRacer(racer: Racer) {
    this.selectedRacer = racer;
    this.selectedRacerTexts = this.texts.filter(text => text.racer.id === racer.id);
  }

  ngOnInit(): void {
    this.getRacers();
    this.getTexts();
  }
}
