import { Component, Input } from "@angular/core";

import * as moment from "moment";

@Component({
  selector: 'time-widget',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss']
})
export class TimeWidget {
  @Input() time: Date;

  getPrettyTimestamp() {
    return moment(this.time).format('HH:mm ddd, Do MMM');
  }
}
