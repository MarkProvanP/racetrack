import { Component, Input } from '@angular/core';
import { Router } from "@angular/router";
import { DataService } from "../../data.service";
import { UserService } from "../../user.service";

import { Team } from '../../../common/team';
import { TeamStatus } from '../../../common/update';

@Component({
  selector: 'dashboard-card',
  templateUrl: './dashboard-card.component.html',
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
