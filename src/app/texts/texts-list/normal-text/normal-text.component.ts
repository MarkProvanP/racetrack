import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Text } from '../../../../common/text';

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

  markTextAsRead() {
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
