import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Racer } from "../../common/racer";
import { Team } from "../../common/team";
import { Text } from '../../common/text';
import { DataService }         from '../data.service';

import * as moment from "moment";

import { AllTextsComponent } from "./all-texts";

@Component({
  selector: "texts",
  templateUrl: "./texts.component.html",
  styleUrls: ["./texts.component.scss"]
})
export class TextsComponent implements OnInit {
  texts: [Text] = <[Text]>[];
  racers: [Racer] = <[Racer]>[];
  teams: [Team] = <[Team]>[];

  selectedTeam: Team;
  selectedTeamTexts: [Text];
  selectedRacer: Racer;
  selectedRacerTexts: [Text];

  constructor(
    private dataService: DataService,
    private router: Router) {}

  getTexts(): void {
    this.dataService.getTexts()
      .then(texts => {
        this.texts = texts.reverse();
        this.texts.forEach(text => this.addRacerToText(text));
      });
  }

  getTeams(): void {
    this.dataService.getTeams()
      .then(teams => {
        this.teams = teams;
      });
  }

  prettyTextTimestamp(text: Text): string {
    return moment(text.timestamp).format('HH:mm ddd, Do MMM');
  }

  getRacers(): void {
    this.dataService.getRacers()
      .then(racers => {
        this.racers = racers;
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

  selectTextsByTeam(team: Team) {
    this.selectedTeam = team;
    this.selectedTeamTexts = this.texts.filter(text => text.team.id === team.id);
  }

  selectTextsByRacer(racer: Racer) {
    this.selectedRacer = racer;
    this.selectedRacerTexts = this.texts.filter(text => text.racer.id === racer.id);
  }

  onTextReceived(text) {
    this.texts.unshift(text);
    this.addRacerToText(text)
  }

  ngOnInit(): void {
    this.getTexts();
    this.getTeams();
    this.getRacers();
    this.dataService.onTextReceived(text => this.onTextReceived(text));
  }
}
