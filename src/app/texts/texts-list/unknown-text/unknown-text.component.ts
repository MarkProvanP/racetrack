import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Text } from '../../../../common/text';

@Component({
  selector: 'unknown-text',
  templateUrl: './unknown-text.template.html',
  styleUrls: ['./unknown-text.style.scss']
})
export class UnknownTextComponent {
  @Input() text: Text;
  @Input() display: any;
  @Output() onMakeRead: EventEmitter = new EventEmitter();
  @Output() onCreateReply: EventEmitter = new EventEmitter();

  linkUnknownTextToRacer(text: Text) {

  }

  markTextAsRead() {
    this.onMakeRead.emit(this.text);
  }

  replyToText() {
    this.onCreateReply.emit(this.text);
  }
}
