import { Component, Input, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text } from '../../../common/text';
import { DataService } from '../../data.service';

import * as moment from "moment";

@Component({
  selector: "team-texts",
  templateUrl: "./team-texts.template.html",
  styleUrls: ["./team-texts.styles.scss"]
})
export class TeamTextsComponent implements OnInit {
  @Input() texts: [Text];
  teams: [Team];
  selectedTeam: Team;
  selectedTeamTexts: [Text];
  displayOptions = {
    oneline: false,
    racer: true,
    timestamp: true
  }
  paramsSub: any;

  constructor(private dataService: DataService, private activatedRoute: ActivatedRoute, private router: Router) {};

  selectTextsByTeam(team: Team) {
    this.selectedTeam = team;
    this.selectedTeamTexts = this.texts.filter(text => {
      if (text.team) {
        return text.team.id === team.id;
      }
    });
  }

  routeToTeam(team: Team) {
    this.router.navigate(['/texts', 'by-team', team.id]);
  }

  getTexts(){
    return this.dataService.getTexts()
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

  getTeams() {
    return this.dataService.getTeams()
      .then(teams => {
        this.teams = teams;
      });
  }

  markTextAsRead(text) {
    this.dataService.updateText(text)
  }

  onTextReceived(text) {
    this.texts.unshift(text);
    this.addRacerToText(text)
  }

  ngOnInit(): void {
    this.getTexts()
      .then(texts => this.getTeams())
      .then(teams => {
        this.paramsSub = this.activatedRoute.params.subscribe(params => {
          let team = this.teams.filter(team => team.id == params['id'])[0]
          this.selectTextsByTeam(team);
        });
      });
    this.dataService.onTextReceived(text => this.onTextReceived(text));
  }
}
