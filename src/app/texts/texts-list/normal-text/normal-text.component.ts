import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Text } from '../../../../common/text';

import { UserActionInfo } from "../../../../server/auth";

import { UserService } from '../../../user.service';

@Component({
  selector: 'normal-text',
  templateUrl: './normal-text.template.html',
  styleUrls: ['./normal-text.style.scss']
})
export class NormalTextComponent {
  @Input() text: Text;
  @Input() display: any;
  @Output() onMakeRead: EventEmitter = new EventEmitter();
  @Output() onCreateReply: EventEmitter = new EventEmitter();
  @Output() onAddCheckin: EventEmitter = new EventEmitter();
  @Output() onCreateUpdate: EventEmitter = new EventEmitter();

  constructor(private userService: UserService) {
    
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
