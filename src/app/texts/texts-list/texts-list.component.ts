import { Component, Input } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { MdUniqueSelectionDispatcher } from "@angular2-material/core";

import { Racer } from "../../../common/racer";
import { Team } from "../../../common/team";
import { Text, InboundText, OutboundText, AppText } from '../../../common/text';
import { DataService } from '../../data.service';
import { TextService } from '../../text.service';

import { OrderBy } from '../../orderBy.pipe.ts';

@Component({
  selector: "texts-list",
  templateUrl: "./texts-list.template.html",
  styleUrls: ["./texts-list.styles.scss"],
  pipes: [OrderBy],
  providers: [MdUniqueSelectionDispatcher]
})
export class TextsListComponent {
  @Input("texts") allTexts: Text[];
  actuallyAllTexts: Text[];

  set allTexts(texts: Text[]) {
    this.actuallyAllTexts = texts;
    this.updateTextFilter();
  }

  filteredTexts: Text[];
  @Input() display;
  inCreateUpdateMode = false;
  inTextSendMode = false;
  selectedText;
  queryParamsSub: any;

  readFilterOption;

  constructor(
    private dataService: DataService,
    private textService: TextService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  markTextAsRead(text: Text) {
    this.textService.updateText(text)
  }

  isOutboundText(text: Text) {
    return text instanceof OutboundText;
  }

  isInboundText(text: Text) {
    return text instanceof InboundText && !this.isAppText(text);
  }

  isAppText(text: Text) {
    return text instanceof AppText;
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

  updateTextFilter(show) {
    if (show == 'unread') {
      this.filteredTexts = this.actuallyAllTexts.filter(text => !text.isRead());
    } else if (show == 'read') {
      this.filteredTexts = this.actuallyAllTexts.filter(text => text.isRead());
    } else {
      this.filteredTexts = this.actuallyAllTexts;
    }
  }

  onFilterUpdate() {
    this.updateTextFilter(this.readFilterOption);
  }

  ngOnInit() {
    this.queryParamsSub = this.activatedRoute.queryParams.subscribe(queryParams => {
      let show = queryParams['show'];
      this.readFilterOption = show;
      this.updateTextFilter(show);
    });
  }
}
