import { Component, Input } from "@angular/core";

import { PhoneNumber } from "../../../common/text";

@Component({
  selector: 'phone-widget',
  templateUrl: './phone-widget.component.pug',
  styleUrls: ['./phone-widget.component.scss']
})
export class PhoneWidget {
  @Input() number: PhoneNumber;
  @Input() edit: boolean;

  numberExists() {
    return this.number && this.number.exists()
  }
}
