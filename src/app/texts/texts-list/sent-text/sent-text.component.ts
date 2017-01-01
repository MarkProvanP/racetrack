import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Text } from '../../../../common/text';

import { DataService } from "../../../data.service";

@Component({
  selector: 'sent-text',
  templateUrl: './sent-text.component.pug',
  styleUrls: ['./sent-text.component.scss']
})
export class SentTextComponent {
  @Input() text: Text;
  @Input() display: any;

  constructor(
    private dataService: DataService
  ) {}
}
