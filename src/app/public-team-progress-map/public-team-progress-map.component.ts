import { Component, OnInit } from "@angular/core";

import { Router, ActivatedRoute } from "@angular/router";
import { DataService } from '../data.service';

import { Team } from '../../common/team';

@Component({
  selector: 'public-team-progress-map',
  templateUrl: './public-team-progress-map.template.html',
  styleUrls: ['./public-team-progress-map.styles.scss']
})
export class PublicTeamProgressMapComponent implements OnInit {
  team: Team;
  paramsSub: any;
  default = {
    lat: 53.612805,
    lng: 5.301865,
    zoom: 6,
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

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute
  ) {

  }

  teamStatusUpdates() {
    if (this.team) {
      return this.team.statusUpdates;
    } else {
      return [];
    }
  }

  ngOnInit() {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      this.dataService.getPublicTeam(params['id'])
        .then(team => this.team = team);
    });
  }
}
