import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { DataService } from '../data.service';
import { Team } from '../../common/team';
import { TeamStatus } from '../../common/update';

const DEFAULT_SHOW_OPTION = 'all';

const SORT_OPTIONS = {
  UPDATE_TIME: "lastCheckin.checkinTime",
  TEAM_NAME: "name",
  TEAM_ID: "id"
}
const DEFAULT_SORT_OPTION = SORT_OPTIONS.UPDATE_TIME;

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.pug',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  allTeams: Team[] = [];
  filteredTeams: Team[];
  queryParamsSub: any;
  teamsFilterOption: any = DEFAULT_SHOW_OPTION;

  loading: boolean = false;
  sortOption = DEFAULT_SORT_OPTION;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {}

  sortOptions = SORT_OPTIONS;
  sortAscending: boolean = true;

  toggleOrder() {
    this.sortAscending = !this.sortAscending;
  }

  get ordering() {
    let upDown = this.sortAscending ? "+" : "-";
    return [upDown + this.sortOption]
  }

  getTeams(): void {
    this.loading = true;
    this.dataService.getTeamsFromBackend()
    .then(teams => {
      this.allTeams = teams;
      this.loading = false;
      this.filterTeams();
    })
  }

  filterTeams() {
    let check = (team) => true;
    if (this.teamsFilterOption == 'uk') {
      check = (team) => !team.inEurope;
    } else if (this.teamsFilterOption == 'europe') {
      check = (team) => team.inEurope;
    }
    this.filteredTeams = this.allTeams.filter(check);
  }

  onFilterUpdate() {
    let navigationExtras = {
      queryParams: { show: this.teamsFilterOption, sort: this.sortOption }
    }
    this.router.navigate([], navigationExtras);
  }

  onSortUpdate() {
    let navigationExtras = {
      queryParams: { show: this.teamsFilterOption, sort: this.sortOption }
    }
    this.router.navigate([], navigationExtras)
  }

  ngOnInit(): void {
    this.getTeams();
    this.queryParamsSub = this.activatedRoute.queryParams.subscribe(queryParams => {
      let show = queryParams['show'] ? queryParams['show'] : DEFAULT_SHOW_OPTION;
      let sort = queryParams['sort'] ? queryParams['sort'] : DEFAULT_SORT_OPTION;
      this.teamsFilterOption = show;
      this.sortOption = sort;
      this.filterTeams();
    });
  }

  goToTeamTexts(team: Team) {
    this.router.navigate(['/safetyteam', 'texts', 'by-team', team.id]);
  }
}
