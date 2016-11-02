import { Component, Input } from "@angular/core";

import * as moment from "moment";

@Component({
  selector: 'time-widget',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss']
})
export class TimeWidget {
  @Input() fromNow: boolean;
  moment: any;

  @Input() set time(date: Date) {
    this.moment = moment(date);
  }

  isDateValid() {
    return this.moment.isValid();
  }

  getPrettyTimestamp() {
    return this.moment.format('HH:mm ddd, Do MMM');
  }

  getPrettyTimeSinceNow() {
    let now = moment();
    let duration = moment.duration(this.moment.diff(now));
    return duration.humanize(true);
  }
}
