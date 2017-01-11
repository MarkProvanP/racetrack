import * as moment from "moment";
import * as _ from "lodash";

import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

import { Team, TeamId } from "../../../../common/team";
import { Racer, RacerId } from "../../../../common/racer";
import { Text, AppText } from '../../../../common/text';

import { UserActionInfo } from "../../../../common/user";

import { UserService } from '../../../user.service';
import { DataService } from "../../../data.service";

@Component({
  selector: 'app-text',
  templateUrl: './app-text.component.pug',
  styleUrls: ['./app-text.component.scss']
})
export class AppTextComponent implements OnInit {
  @Input() text: AppText;
  @Input() display: any;
  @Output() onMakeRead: EventEmitter<AppText> = new EventEmitter();
  @Output() onCreateReply: EventEmitter<AppText> = new EventEmitter();
  @Output() onAddCheckin: EventEmitter<AppText> = new EventEmitter();
  @Output() onCreateUpdate: EventEmitter<AppText> = new EventEmitter();
  textTeam: Team;
  textRacer: Racer;

  constructor(
    private userService: UserService,
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

  stringThing() {
    return JSON.stringify(this.text.location);
  }

  markTextAsRead() {
    this.text.readBy = this.userService.getUserAction();
    this.onMakeRead.emit(this.text);
  }

  replyToText() {
    this.onCreateReply.emit(this.text);
  }

  addCheckIn() {
    this.onAddCheckin.emit(this.text);
  }

  createUpdate() {
    this.onCreateUpdate.emit(this.text);
  }

  canCheckinFromText() {
    if (!this.textTeam) return false;
    if (!this.textTeam.lastCheckin) return true;
    if (_.isEmpty(this.textTeam.lastCheckin.checkinTime)) return true;
    let lastCheckinMoment = moment(this.textTeam.lastCheckin.checkinTime)
    let textMoment = moment(this.text.timestamp);
    return lastCheckinMoment.isBefore(textMoment);
  }

  canUpdateFromText() {
    if (!this.textTeam) return false;
    if (!this.textTeam.statusUpdates.length) return true;
    let lastUpdateMoment = moment(this.textTeam.getLastUpdate().timestamp)
    let textMoment = moment(this.text.timestamp);
    return lastUpdateMoment.isBefore(textMoment);
  }
}
