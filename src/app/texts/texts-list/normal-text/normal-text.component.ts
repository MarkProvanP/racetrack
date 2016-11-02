import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Text, InboundText } from '../../../../common/text';

import { UserActionInfo } from "../../../../common/user";

import { UserService } from '../../../user.service';

@Component({
  selector: 'normal-text',
  templateUrl: './normal-text.template.html',
  styleUrls: ['./normal-text.style.scss']
})
export class NormalTextComponent {
  @Input() text: InboundText;
  @Input() display: any;
  @Output() onMakeRead: EventEmitter<InboundText> = new EventEmitter();
  @Output() onCreateReply: EventEmitter<InboundText> = new EventEmitter();
  @Output() onAddCheckin: EventEmitter<InboundText> = new EventEmitter();
  @Output() onCreateUpdate: EventEmitter<InboundText> = new EventEmitter();

  constructor(private userService: UserService) {
    
  }

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
}
