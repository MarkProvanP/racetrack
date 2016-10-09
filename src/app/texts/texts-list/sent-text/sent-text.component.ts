import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Text } from '../../../../common/text';

@Component({
  selector: 'sent-text',
  templateUrl: './sent-text.template.html',
  styleUrls: ['./sent-text.style.scss']
})
export class SentTextComponent {
  @Input() text: Text;
  @Input() display: any;
}
