import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { DataService } from '../data.service';
import { Team } from '../../common/team';
import { TeamStatus } from '../../common/update';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.template.html',
  styleUrls: ['./dashboard.styles.scss']
})
export class DashboardComponent implements OnInit {
  teams: Team[] = [];
  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  getTeams(): void {
    this.dataService
        .getTeams()
        .then(teams => this.teams = teams);
  }

  getCardClass(team: Team) {
    switch (team.getCurrentStatus()) {
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

  ngOnInit(): void {
    this.getTeams();
  }

  goToTeamTexts(team: Team) {
    this.router.navigate(['/texts', 'by-team', team.id]);
  }
}
