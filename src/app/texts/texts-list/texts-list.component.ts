import { Component, Input } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text, InboundText, OutboundText } from '../../../common/text';
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
  @Input("texts") allTexts: Text[];
  filteredTexts: Text[];
  @Input() display;
  inCreateUpdateMode = false;
  inTextSendMode = false;
  selectedText;
  paramsSub;

  constructor(
    private dataService: DataService,
    private textService: TextService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  markTextAsRead(text: Text) {
    console.log('marking text', text, 'as read');
    this.textService.updateText(text)
  }

  isOutboundText(text: Text) {
    return text instanceof OutboundText;
  }

  isInboundText(text: Text) {
    return text instanceof InboundText;
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

  replyToText(text: Text) {
    this.inTextSendMode = true;
    this.selectedText = text;
  }

  onTextSendClose() {
    this.inTextSendMode = false;
    this.selectedText = undefined;
  }

  onStatusCreated() {
    this.inCreateUpdateMode = false;
    this.selectedText = undefined;
  }

  ngOnInit() {
    this.queryParamsSub = this.activatedRoute.queryParams.subscribe(queryParams => {
      let show = queryParams.show;
      if (show == 'unread') {
        this.filteredTexts = this.allTexts.filter(text => !text.isRead());
      } else {
        this.filteredTexts = this.allTexts;
      }
    });
  }
}
