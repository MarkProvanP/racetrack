import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";

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
  selectedTeam: Team;
  selectedTeamTexts: [Text];

  constructor(private dataService: DataService) {};

  prettyTextTimestamp(text: Text): string {
    return moment(text.timestamp).format('HH:mm ddd, Do MMM');
  }

  selectTextsByTeam(team: Team) {
    this.selectedTeam = team;
    this.selectedTeamTexts = this.texts.filter(text => text.team.id === team.id);
  }

  getTeams(): void {
    this.dataService.getTeams()
      .then(teams => {
        this.teams = teams;
      });
  }

  ngOnInit(): void {
    this.getTeams();
  }
}
