import * as moment from "moment";
import * as _ from "lodash";

import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Text, InboundText } from '../../../../common/text';

import { UserActionInfo } from "../../../../common/user";

import { UserService } from '../../../user.service';
import { DataService } from "../../../data.service";

@Component({
  selector: 'normal-text',
  templateUrl: './normal-text.component.pug',
  styleUrls: ['./normal-text.component.scss']
})
export class NormalTextComponent {
  @Input() text: InboundText;
  @Input() display: any;
  @Output() onMakeRead: EventEmitter<InboundText> = new EventEmitter();
  @Output() onCreateReply: EventEmitter<InboundText> = new EventEmitter();
  @Output() onAddCheckin: EventEmitter<InboundText> = new EventEmitter();
  @Output() onCreateUpdate: EventEmitter<InboundText> = new EventEmitter();

  constructor(
    private userService: UserService
  ) {}

  markTextAsRead() {
    this.text.readBy = this.userService.getUserAction();
    this.onMakeRead.emit(this.text);
  }

  setTextUnread() {
    this.text.readBy = undefined;
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
