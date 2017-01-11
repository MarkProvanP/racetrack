import { Component, OnInit, Pipe, PipeTransform } from "@angular/core";

import { DataService } from '../data.service';

import { Team } from '../../common/team';

const FOCUS_MAP_ZOOM_LEVEL = 10;

@Component({
  selector: 'safety-map',
  templateUrl: './safety-map.component.pug',
  styleUrls: ['./safety-map.component.scss'],
})
export class SafetyMapComponent implements OnInit {
  teams: Team[] = [];
  defaultMapSettings = {
    lat: 53.612805,
    lng: 5.301865,
    zoom: 6
  }

  getIconUrlForTeam(team: Team) {
    return `/r2bcknd/misc/team-pin/${team.id}`
  }

  currentMapSettings = JSON.parse(JSON.stringify(this.defaultMapSettings));

  onMapCenterChange({lat, lng}) {
    this.currentMapSettings.lat = lat;
    this.currentMapSettings.lng = lng;
  }

  onMapZoomChange(zoom) {
    this.currentMapSettings.zoom = zoom;
  }

  hostel = {
    lat: 50.0718908,
    lng: 14.4462584,
    iconUrl: '/assets/map-pin/smaller-map-marker.svg'
  }

  expandedTeam: Team;
  isTeamExpanded(team: Team) {
    return this.expandedTeam == team;
  }
  toggleTeamExpand(team: Team) {
    if (this.expandedTeam == team) {
      this.expandedTeam = undefined;
    } else {
      this.expandedTeam = team;
    }
  }

  constructor(
    private dataService: DataService
  ) {
    this.dataService.addTeamsChangedListener(teams => {
      this.teams = teams;
    })
    this.dataService.addUpdatesChangedListener(updates => {
      this.teams = this.dataService.getTeams();
    })
  }

  moveMapToTeam(team: Team) {
    let lastUpdate = team.getLastUpdate();
    if (!lastUpdate) {
      return;
    }

    let lat = lastUpdate.location.latitude;
    let lng = lastUpdate.location.longitude;

    this.currentMapSettings.lat = lat;
    this.currentMapSettings.lng = lng;
    this.currentMapSettings.zoom = FOCUS_MAP_ZOOM_LEVEL;
    console.log(this.currentMapSettings);
  }

  ngOnInit() {
    this.teams = this.dataService.getTeams()
  }
}
