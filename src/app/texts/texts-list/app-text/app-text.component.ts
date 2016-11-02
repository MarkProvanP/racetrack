import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Text, AppText } from '../../../../common/text';

import { UserActionInfo } from "../../../../common/user";

import { UserService } from '../../../user.service';

@Component({
  selector: 'app-text',
  templateUrl: './app-text.template.html',
  styleUrls: ['./app-text.style.scss']
})
export class AppTextComponent {
  @Input() text: AppText;
  @Input() display: any;
  @Output() onMakeRead: EventEmitter = new EventEmitter();
  @Output() onCreateReply: EventEmitter = new EventEmitter();
  @Output() onAddCheckin: EventEmitter = new EventEmitter();
  @Output() onCreateUpdate: EventEmitter = new EventEmitter();

  constructor(private userService: UserService) {
    
  }

  stringThing() {
    return JSON.stringify(this.text.location);
  }

  markTextAsRead() {
    (<InboundText> this.text).readBy = this.userService.getUserAction();
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
}
