import { Component, Input } from "@angular/core";

import { Text } from "../../../common/text";

@Component({
  selector: 'text-widget',
  templateUrl: './text-widget.component.html',
  styleUrls: ['./text-widget.component.scss']
})
export class TextWidget {
  @Input() text: Text;
}
