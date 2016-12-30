import { Component, Input } from "@angular/core";

import { PhoneNumber } from "../../../common/text";

@Component({
  selector: 'phone-widget',
  templateUrl: './phone-widget.component.pug',
  styleUrls: ['./phone-widget.component.scss']
})
export class PhoneWidget {
  @Input() number: PhoneNumber;

  getCountryCode() {
    return this.number.substring(0, 3);
  }

  getNumber() {
    return this.number.substring(3);
  }
}
