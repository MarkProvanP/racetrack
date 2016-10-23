import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { DataService } from '../data.service';
import { Team } from '../../common/team';
import { TeamStatus } from '../../common/update';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.template.html',
  styleUrls: ['./dashboard.styles.scss']
})
export class DashboardComponent implements OnInit {
  allTeams: Team[] = [];
  filteredTeams: Team[];
  queryParamsSub: any;
  teamsFilterOption: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {}

  getTeams(): void {
    this.dataService
        .getTeams()
        .then(teams => this.allTeams = teams)
        .then(teams => this.filterTeams());
  }

  filterTeams() {
    let check = () => true;
    if (this.teamsFilterOption == 'uk') {
      check = (team) => !team.inEurope;
    } else if (this.teamsFilterOption == 'europe') {
      check = (team) => team.inEurope;
    }
    this.filteredTeams = this.allTeams.filter(check);
  }

  onFilterUpdate() {
    let navigationExtras = {
      queryParams: { show: this.teamsFilterOption }
    }
    this.router.navigate(['/safetyteam', 'dashboard'], navigationExtras);
  }

  ngOnInit(): void {
    this.getTeams();
    this.queryParamsSub = this.activatedRoute.queryParams.subscribe(queryParams => {
      let show = queryParams['show'];
      this.teamsFilterOption = show;
      this.filterTeams();
    });
  }

  goToTeamTexts(team: Team) {
    this.router.navigate(['/safetyteam', 'texts', 'by-team', team.id]);
  }
}
