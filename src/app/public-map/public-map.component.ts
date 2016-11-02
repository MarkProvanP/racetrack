import { Component, OnInit, Pipe, PipeTransform } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { DataService } from '../data.service';

import { Team } from '../../common/team';

@Pipe({
  name: 'teamHasUpdate',
  pure: true
})
export class TeamHasUpdatePipe implements PipeTransform {
  transform(input: any) {
    return input.filter(team => team.getLastUpdate())
  }
}

const ICON_FILENAME = "/assets/map-pin/Map_marker-64.png";

@Component({
  selector: 'public-map',
  templateUrl: './public-map.template.html',
  styleUrls: ['./public-map.styles.scss'],
  pipes: [TeamHasUpdatePipe]
})
export class PublicMapComponent implements OnInit {
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
    iconUrl: ''
  }

  whut(team) {
    console.log(team);
    return JSON.stringify(team);
  }

  //50.0718908,14.4462584
  //53.612805,5.301865,

  constructor(
    private dataService: DataService,
    private router: Router
  ) {

  }

  goToTeamProgress(team: Team) {
    this.router.navigate(['/team-progress', team.id]);
  }

  ngOnInit() {
    this.hostel.iconUrl = window.location.origin + ICON_FILENAME;
    this.dataService.getPublicTeams()
      .then(teams => this.teams = teams);
  }

  toNumber(s) {
    return Number(s);
  }
}
