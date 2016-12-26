import * as moment from "moment";

import { Component, Input } from '@angular/core';
import { Router } from "@angular/router";
import { DataService } from "../../data.service";
import { UserService } from "../../user.service";

import { Team } from '../../../common/team';
import { TeamStatus } from '../../../common/update';

const ALLOWED_CHECKIN_DURATION = moment.duration(3, 'hours');

@Component({
  selector: 'dashboard-card',
  templateUrl: './dashboard-card.component.pug',
  styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent {
  @Input() team: Team;
  constructor(
    private router: Router,
    private dataService: DataService,
    private userService: UserService
  ) {}

  getCardClass() {
    switch (this.team.getCurrentStatus()) {
      case TeamStatus.ON_START_BUS: return "team-on-bus";
      case TeamStatus.OKAY: return "team-ok";
      case TeamStatus.IN_HOSTEL: return "team-in-hostel";
      case TeamStatus.DROPPED_OUT: return "team-dropped-out";
      case TeamStatus.ASLEEP: return "team-asleep";
      case TeamStatus.OVERDUE: return "team-overdue";
      case TeamStatus.MAYBE_LATE: return "team-maybe-late";
      case TeamStatus.IN_CITY: return "team-in-city";
      case TeamStatus.UNKNOWN: return "team-error";
    }
  }
  
  openMap() {

  }

  checkinProgressBarColor() {
    let ratio = this.checkinProgressBarValue();
    if (ratio < 100) {
      return 'accent'
    } else {
      return 'warn'
    }
  }

  getOverdueTime() {
    let now = moment();
    let lastCheckinTime = moment(this.team.lastCheckin.checkinTime);
    let duration = moment.duration(now.diff(lastCheckinTime));
    let overdue = duration.subtract(ALLOWED_CHECKIN_DURATION);
    if overdue.asSeconds() > 0 return overdue;
  }

  checkinProgressBarTitle() {
    let now = moment();
    let lastCheckinTime = moment(this.team.lastCheckin.checkinTime);
    let duration = moment.duration(now.diff(lastCheckinTime));
    let lastCheckinTime = moment(this.team.lastCheckin.checkinTime);
    return `Last checked in ${duration.humanize()} ago, allowed ${ALLOWED_CHECKIN_DURATION.humanize()}`
  }

  checkinProgressBarValue() {
    let now = moment();
    let lastCheckinTime = moment(this.team.lastCheckin.checkinTime);
    let duration = moment.duration(now.diff(lastCheckinTime));
    let durationSeconds = duration.asSeconds();
    let allowedSeconds = ALLOWED_CHECKIN_DURATION.asSeconds();
    let ratio = durationSeconds/allowedSeconds);
    return Math.round(ratio * 100);
  }

  goToTeamTexts() {
    this.router.navigate(['/safetyteam', 'texts', 'by-team', this.team.id]);
  }

  goToTeamUpdates() {
    this.router.navigate(['/safetyteam', 'updates', this.team.id]);
  }

  checkinTimeoutClass() {

  }

  checkInTeam() {
    this.team.lastCheckin = {
      checkinTime: new Date(),
      byUser: this.userService.getUserAction()
    }
    this.dataService.updateTeam(this.team);
  }
}
