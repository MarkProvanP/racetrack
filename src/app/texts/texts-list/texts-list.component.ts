import { Component, Input } from "@angular/core";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text } from '../../../common/text';
import { DataService } from '../../data.service';

import * as moment from "moment";

@Component({
  selector: "texts-list",
  templateUrl: "./texts-list.template.html",
  styleUrls: ["./texts-list.styles.scss"]
})
export class TextsListComponent {
  @Input() texts: Text[];
  @Input() display;

  constructor(private dataService: DataService) {}

  markTextAsRead(text: Text) {
    this.dataService.updateText(text)
  }

  checkInTeamFromText(text: Text) {
    let team = text.team;
    team.lastCheckin = text.timestamp;
    this.dataService.updateTeam(team);
  }
}
