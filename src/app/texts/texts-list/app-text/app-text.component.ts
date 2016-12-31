import * as moment from "moment";
import * as _ from "lodash";

import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Text, AppText } from '../../../../common/text';

import { UserActionInfo } from "../../../../common/user";

import { UserService } from '../../../user.service';

@Component({
  selector: 'app-text',
  templateUrl: './app-text.component.pug',
  styleUrls: ['./app-text.component.scss']
})
export class AppTextComponent {
  @Input() text: AppText;
  @Input() display: any;
  @Output() onMakeRead: EventEmitter<AppText> = new EventEmitter();
  @Output() onCreateReply: EventEmitter<AppText> = new EventEmitter();
  @Output() onAddCheckin: EventEmitter<AppText> = new EventEmitter();
  @Output() onCreateUpdate: EventEmitter<AppText> = new EventEmitter();

  constructor(private userService: UserService) {
    
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

  canCheckinFromText(text: Text) {
    if (!text.team) return false;
    if (_.isEmpty(text.team.lastCheckin.checkinTime)) return true;
    let lastCheckinMoment = moment(text.team.lastCheckin.checkinTime)
    let textMoment = moment(text.timestamp);
    return lastCheckinMoment.isBefore(textMoment);
  }

  canUpdateFromText(text: Text) {
    if (!text.team) return false;
    if (!text.team.statusUpdates.length) return true;
    let lastUpdateMoment = moment(text.team.getLastUpdate().timestamp)
    let textMoment = moment(text.timestamp);
    return lastUpdateMoment.isBefore(textMoment);
  }
}
