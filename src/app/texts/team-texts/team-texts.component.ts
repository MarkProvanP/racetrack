import { Component, Input, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text } from '../../../common/text';
import { DataService } from '../../data.service';
import { TextService, TextFilterOptions } from '../../text.service';

@Component({
  selector: "team-texts",
  templateUrl: "./team-texts.component.pug",
  styleUrls: ["./team-texts.component.scss"]
})
export class TeamTextsComponent implements OnInit {
  @Input() texts: Text[];
  teams: Team[];
  selectedTeam: Team;
  selectedTeamTexts: Text[];
  displayOptions = {
    oneline: false,
    racer: true,
    timestamp: true
  }
  paramsSub: any;

  constructor(
    private dataService: DataService,
    private textService: TextService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {};

  getTeamLink(team: Team) {
    return `/safetyteam/texts/by-team/${team.id}`;
  }

  getTeams() {
    return this.dataService.getTeams()
      .then(teams => {
        this.teams = teams;
      });
  }

  selectTextsByTeam(team: Team) {
    this.selectedTeam = team;
    if (team) {
      let filterOptions = new TextFilterOptions({hasTeam: true, team: this.selectedTeam});
      this.selectedTeamTexts = this.textService.getTextsFiltered(filterOptions);
    } else {
      this.selectedTeamTexts = [];
    }
  }

  markTextAsRead(text) {
    this.textService.updateTextAndWriteToBackend(text)
  }

  numberUnreadMessagesForTeam(team: Team) {
    let filterOptions = new TextFilterOptions({team: team, read: false});
    let matchingTexts = this.textService.getTextsFiltered(filterOptions)
    if (matchingTexts) {
      return matchingTexts.length;
    }
  }

  private onTextsChanged() {
    this.selectTextsByTeam(this.selectedTeam);
  }

  ngOnInit(): void {
    this.textService.addTextsChangedCallback(texts => {
      this.texts = texts;
      this.onTextsChanged();
    });
    this.texts = this.textService.getAllTexts();
    this.getTeams()
      .then(teams => {
        this.paramsSub = this.activatedRoute.params.subscribe(params => {
          let team = this.teams.filter(team => team.id == params['id'])[0]
          this.selectTextsByTeam(team);
        });
      });
  }
}
