import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { DataService } from '../data.service';

import { Team } from '../../common/team';

@Component({
  selector: 'public-map',
  templateUrl: './public-map.component.pug',
  styleUrls: ['./public-map.component.scss']
})
export class PublicMapComponent implements OnInit {
  teams: Team[] = [];
  default = {
    lat: 53.612805,
    lng: 5.301865,
    zoom: 6
  }
  hostel = {
    lat: 50.0718908,
    lng: 14.4462584,
    iconUrl: '/assets/map-pin/Map_marker-64.png'
  }

  polylineSettings = {
    strokeColor: 'red',
    strokeWeight: 5,
    strokeOpacity: 1.0
  }

  expandedTeam: Team;
  teamShowingProgress: Team;

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  showingAllTeams() {
    if (this.teamShowingProgress) {
      return []
    } else {
      return this.teams;
    }
  }

  showTeamProgress(team: Team) {
    this.teamShowingProgress = team;
  }

  backToAllTeams() {
    this.teamShowingProgress = undefined;
  }

  goToTeamProgress(team: Team) {
    this.router.navigate(['/team-progress', team.id]);
  }

  ngOnInit() {
    this.dataService.getPublicTeams()
      .then(teams => this.teams = teams);
  }

  isTeamExpanded(team: Team) {
    return this.expandedTeam == team;
  }

  teamStatusUpdates() {
    if (!this.teamShowingProgress) {
      return [];
    }
    return this.teamShowingProgress.statusUpdates;
  }

  toggleTeamExpand(team: Team) {
    if (this.expandedTeam == team) {
      this.expandedTeam = undefined;
    } else {
      this.expandedTeam = team;
    }
  }
}
