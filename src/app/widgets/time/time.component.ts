import { Component, Input } from "@angular/core";

import * as moment from "moment-timezone";

const TIMEZONES = {
  UK: "Europe/London",
  EU: "Europe/Prague"
}

@Component({
  selector: 'time-widget',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss']
})
export class TimeWidget {
  @Input() fromNow: boolean;
  moment: any;
  timezone: string = TIMEZONES.UK;

  @Input() set time(date: Date) {
    this.moment = moment(date).tz(this.timezone);
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

  toggleTimezone() {
    if (this.timezone == TIMEZONES.UK) {
      this.timezone = TIMEZONES.EU;
    } else {
      this.timezone = TIMEZONES.UK;
    }
    this.moment.tz(this.timezone);
  }

  getTimezone() {
    return this.timezone;
  }
}
