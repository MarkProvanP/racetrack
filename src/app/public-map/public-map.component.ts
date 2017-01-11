import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { DataService } from '../data.service';

import { Team, TeamId } from '../../common/team';

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
    iconUrl: '/assets/map-pin/chequered-map-marker.svg'
  }

  polylineSettings = {
    strokeColor: 'red',
    strokeWeight: 5,
    strokeOpacity: 1.0
  }

  expandedTeam: Team;
  teamShowingProgress: Team;
  showingTeamId: TeamId;
  paramsSub: any;

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  getIconUrlForTeam(team: Team) {
    return `/r2bcknd/misc/team-pin/${team.id}`
  }

  showingAllTeams() {
    if (this.teamShowingProgress) {
      return []
    } else {
      return this.teams;
    }
  }

  showTeamProgress(team: Team) {
    this.router.navigate(['/track', team.id])
  }

  backToAllTeams() {
    this.router.navigate(['/'])
  }

  private loadShowingTeam() {
    if (!this.showingTeamId) {
      this.teamShowingProgress = undefined;
    }
    let matchingTeams = this.teams.filter(team => team.id == this.showingTeamId);
    if (matchingTeams.length) {
      this.teamShowingProgress = matchingTeams[0];
    }
  }

  ngOnInit() {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.showingTeamId = params['id'];
      this.loadShowingTeam();
    })
    this.dataService.getPublicTeams()
    .then(teams => this.teams = teams)
    .then(() => this.loadShowingTeam())
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
