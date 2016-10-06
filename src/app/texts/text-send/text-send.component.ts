import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import { Racer } from '../../../common/racer';
import { Text, PhoneNumber } from '../../../common/text';

import { TextService } from '../../text.service';

@Component({
  selector: 'text-send',
  templateUrl: './text-send.template.html',
  styleUrls: ['./text-send.styles.scss']
})
export class TextSendComponent {
  @Input() toRacer: Racer;
  @Output() onTextSendClose = new EventEmitter();
  toPhoneNumber: PhoneNumber;
  message: string;
  isSending = false;

  constructor(
    private textService: TextService
  ) {}

  sendNewText() {
    this.isSending = true;
    this.textService.sendText(this.toPhoneNumber, this.message)
      .then(response => {
        this.isSending = false;
        this.onTextSendClose.emit();
      });
  }

  cancelNewText() {
    this.onTextSendClose.emit();
  }

  ngOnInit() {
    if (this.toRacer) {
      this.toPhoneNumber = this.toRacer.phone;
    }
  }
}
