import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { DataService } from "../../data.service";

import { Team } from '../../../common/team';
import { TeamStatus } from '../../../common/update';

@Component({
  selector: 'dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent implements OnInit {
  @Input() team: Team;
  constructor(
    private router: Router,
    private dataService: DataService
  ) {}

  getCardClass() {
    switch (this.team.getCurrentStatus()) {
      case TeamStatus.ON_START_BUS: return "team-on-bus";
      case TeamStatus.IN_UK: return "team-in-uk";
      case TeamStatus.IN_EUROPE: return "team-in-europe";
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

  checkinTimeoutClass() {

  }

  checkInTeam() {
    this.team.lastCheckin = new Date();
    this.dataService.updateTeam(this.team);
  }
}
