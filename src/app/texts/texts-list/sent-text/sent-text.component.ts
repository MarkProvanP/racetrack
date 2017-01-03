import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

import { Team, TeamId } from "../../../../common/team";
import { Racer, RacerId } from "../../../../common/racer";
import { Text } from '../../../../common/text';

import { DataService } from "../../../data.service";

@Component({
  selector: 'sent-text',
  templateUrl: './sent-text.component.pug',
  styleUrls: ['./sent-text.component.scss']
})
export class SentTextComponent implements OnInit {
  @Input() text: Text;
  @Input() display: any;
  textTeam: Team;
  textRacer: Racer;

  constructor(
    private dataService: DataService
  ) {}

  ngOnInit() {
    let teamId = this.text.team;
    if (teamId) {
      this.dataService.getTeamPromise(teamId)
      .then(team => this.textTeam = team);
    }
    let racerId = this.text.racer;
    if (racerId) {
      this.dataService.getRacerPromise(racerId)
      .then(racer => this.textRacer = racer);
    }
  }
}
