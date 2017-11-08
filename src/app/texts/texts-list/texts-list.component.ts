import { Component, Input } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material";

import { Racer } from "../../../common/racer";
import { Team, CheckinInfo } from "../../../common/team";
import { Text, TextId, InboundText, OutboundText, AppText, NonNativeText } from '../../../common/text';
import { DataService } from '../../data.service';
import { TextService } from '../../text.service';
import { UserService } from '../../user.service';

import * as moment from "moment";

const NUM_TEXTS_DISPLAYED_SIMULTANEOUSLY = 10;
const DEFAULT_SHOW_OPTION = 'all';

const DEFAULT_SNACKBAR_CONFIG = new MatSnackBarConfig();
DEFAULT_SNACKBAR_CONFIG.duration = 5000;

@Component({
  selector: "texts-list",
  templateUrl: "./texts-list.component.pug",
  styleUrls: ["./texts-list.component.scss"]
})
export class TextsListComponent {
  actuallyAllTexts: Text[];

  @Input("texts") set allTexts(texts: Text[]) {
    if (texts) {
      this.actuallyAllTexts = texts.sort((t1, t2) => moment(t2.timestamp).diff(moment(t1.timestamp)));
    }
    this.updateTextFilter();
    this.setDefaultTextDisplay();
    this.updateDisplayedTexts();
  }

  filteredTexts: Text[];
  displayedTexts: Text[];
  textsBeforeFirst = 0;
  firstDisplayedText: TextId;
  firstDisplayedTextIndex: number;
  lastDisplayedText: TextId;
  lastDisplayedTextIndex: number;
  textsAfterLast = 0;

  @Input() display;
  inCreateUpdateMode = false;
  inTextSendMode = false;
  selectedText;
  selectedTextTeam: Team;
  queryParamsSub: any;

  readFilterOption;

  constructor(
    private dataService: DataService,
    private textService: TextService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  updateText(text: Text, message?: string) {
    this.textService.updateTextAndWriteToBackend(text)
    .then(res => {
      this.snackBar.open(message || 'Updated text', undefined, DEFAULT_SNACKBAR_CONFIG);
    })
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

  isNonNativeText(text: Text) {
    return text instanceof NonNativeText;
  }

  checkInTeamFromText(text: Text) {
    let teamId = text.team;
    let lastCheckin = {
      checkinTime: text.timestamp,
      byUser: this.userService.getUserAction()
    }
    return this.dataService.getTeamPromise(teamId)
    .then(team => {
      team.lastCheckin = lastCheckin
      return this.dataService.updateTeamAndWriteToBackend(team)
    })
    .then(res => {
      this.snackBar.open("Checked in team from text", undefined, DEFAULT_SNACKBAR_CONFIG);
    });
  }

  createUpdateFromText(text: Text) {
    this.inCreateUpdateMode = true;
    this.selectedText = text;
    this.selectedTextTeam = this.dataService.getTeam(text.team)
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

  setDefaultTextDisplay() {
    if (!this.filteredTexts) {
      return;
    }
    let numTexts = this.filteredTexts.length;
    if (numTexts) {
      this.firstDisplayedText = this.filteredTexts[0].id;
      this.firstDisplayedTextIndex = 0;
      let lastTextIndex;
      if (numTexts > NUM_TEXTS_DISPLAYED_SIMULTANEOUSLY) {
        lastTextIndex = NUM_TEXTS_DISPLAYED_SIMULTANEOUSLY - 1;
      } else {
        lastTextIndex = numTexts - 1;
      }
      this.lastDisplayedText = this.filteredTexts[lastTextIndex].id;
      this.lastDisplayedTextIndex = lastTextIndex;
    }
  }

  showMoreBefore() {
    let newIndex = this.firstDisplayedTextIndex - NUM_TEXTS_DISPLAYED_SIMULTANEOUSLY;
    if (newIndex < 0) {
      newIndex = 0;
    }
    let newFirstText = this.filteredTexts[newIndex];
    this.firstDisplayedText = newFirstText.id;
    this.firstDisplayedTextIndex = newIndex;
    this.updateDisplayedTexts();
  }

  showMoreAfter() {
    let newIndex = this.lastDisplayedTextIndex + NUM_TEXTS_DISPLAYED_SIMULTANEOUSLY;
    if (newIndex > this.filteredTexts.length - 1) {
      newIndex = this.filteredTexts.length - 1;
    }
    let newLastText = this.filteredTexts[newIndex];
    this.lastDisplayedText = newLastText.id;
    this.lastDisplayedTextIndex = newIndex;
    this.updateDisplayedTexts();
  }

  updateDisplayedTexts() {
    this.displayedTexts = [];
    this.textsBeforeFirst = 0;
    this.textsAfterLast = 0;
    let foundFirst = false;
    let foundLast = false;
    if (!this.filteredTexts) {
      return;
    }
    for (let i = 0; i < this.filteredTexts.length; i++) {
      let text = this.filteredTexts[i];
      if (!foundFirst) {
        foundFirst = (text.id == this.firstDisplayedText);
      }
      if (foundFirst && !foundLast) {
        this.displayedTexts.push(text);
      } else if (!foundFirst) {
        this.textsBeforeFirst++;
      } else if (foundFirst && foundLast) {
        this.textsAfterLast++;
      }
      if (text.id == this.lastDisplayedText) {
        foundLast = true;
      }
    }
  }

  updateTextFilter(show?) {
    if (show == 'unread') {
      this.filteredTexts = this.actuallyAllTexts.filter(text => !text.isRead());
    } else if (show == 'read') {
      this.filteredTexts = this.actuallyAllTexts.filter(text => text.isRead());
    } else {
      this.filteredTexts = this.actuallyAllTexts;
    }
    this.setDefaultTextDisplay();
    this.updateDisplayedTexts();
  }

  onFilterUpdate() {
    let navigationExtras = {
      queryParams: { show: this.readFilterOption }
    }
    this.router.navigate([], navigationExtras);
  }

  ngOnInit() {
    this.queryParamsSub = this.activatedRoute.queryParams.subscribe(queryParams => {
      let show = queryParams['show'] ? queryParams['show'] : DEFAULT_SHOW_OPTION;
      this.readFilterOption = show;
      this.updateTextFilter(show);
      this.setDefaultTextDisplay();
      this.updateDisplayedTexts();
    });
  }
}
