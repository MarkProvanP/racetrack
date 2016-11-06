import { Component, Input } from "@angular/core";

import { UserService, Timezone, TIMEZONES } from "../../user.service";

import * as moment from "moment-timezone";

@Component({
  selector: 'time-widget',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.scss']
})
export class TimeWidget {
  @Input() fromNow: boolean;
  moment: any;
  timezone: Timezone = TIMEZONES.UK;
  globalTimezone: Timezone;
  differentToGlobal = false;

  @Input() set time(date: Date) {
    this.moment = moment(date).tz(this.timezone.long);
  }

  constructor(
    private userService: UserService
  ) {
    this.userService.addTimezoneChangedListener(timezone => {
      this.globalTimezone = timezone;
      if (!this.differentToGlobal) {
        this.setTimezone(timezone);
      }
    })
  }

  setTimezone(timezone: Timezone) {
    this.timezone = timezone;
    if (this.moment) {
      this.moment.tz(this.timezone.long);
    }
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
    this.differentToGlobal = !this.differentToGlobal;
    if (this.timezone == TIMEZONES.UK) {
      this.timezone = TIMEZONES.EU;
    } else {
      this.timezone = TIMEZONES.UK;
    }
    this.setTimezone(this.timezone);
  }

  getTimezone() {
    return this.timezone;
  }

  getClass() {
    if (this.differentToGlobal && this.timezone.short != this.globalTimezone.short) {
      return "not-global";
    }
  }
}
