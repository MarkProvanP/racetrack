import { Component, OnInit, Pipe, PipeTransform } from "@angular/core";

import { DataService } from '../data.service';

import { Team } from '../../common/team';

@Component({
  selector: 'safety-map',
  templateUrl: './safety-map.component.pug',
  styleUrls: ['./safety-map.component.scss'],
})
export class SafetyMapComponent implements OnInit {
  teams: Team[] = [];
  default = {
    lat: 53.612805,
    lng: 5.301865,
    zoom: 6,
    iconUrl: '/assets/icon/favicon-16x16.png'
  }
  hostel = {
    lat: 50.0718908,
    lng: 14.4462584,
    iconUrl: 'http://localhost:3000/assets/map-pin/Map_marker-64.png'
  }

  constructor(
    private dataService: DataService
  ) {
    this.dataService.addTeamsChangedListener(teams => {
      this.teams = teams;
    })
    this.dataService.addUpdatesChangedListener(updates => {
      this.teams = this.dataService.getAllTeams();
    })
  }

  highlightTeam(team: Team) {

  }

  ngOnInit() {
    this.teams = this.dataService.getAllTeams()
  }
}
