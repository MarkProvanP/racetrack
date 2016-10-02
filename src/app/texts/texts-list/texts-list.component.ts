import { Component, Input } from "@angular/core";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text } from '../../../common/text';
import { DataService } from '../../data.service';
import { TextService } from '../../text.service';

import * as moment from "moment";

import { OrderBy } from '../../orderBy.pipe.ts';

@Component({
  selector: "texts-list",
  templateUrl: "./texts-list.template.html",
  styleUrls: ["./texts-list.styles.scss"],
  pipes: [OrderBy]
})
export class TextsListComponent {
  @Input() texts: Text[];
  @Input() display;
  inCreateUpdateMode = false;
  selectedText;

  constructor(
    private dataService: DataService,
    private textService: TextService
  ) {}

  markTextAsRead(text: Text) {
    this.textService.updateText(text)
  }

  checkInTeamFromText(text: Text) {
    let team = text.team;
    team.lastCheckin = text.timestamp;
    this.dataService.updateTeam(team);
  }

  createUpdateFromText(text: Text) {
    this.inCreateUpdateMode = true;
    this.selectedText = text;
  }

  onStatusCreated() {
    this.inCreateUpdateMode = false;
    this.selectedText = undefined;
  }
}
