import { Component, OnInit, Pipe, PipeTransform } from "@angular/core";

import { DataService } from '../data.service';

import { Team } from '../../common/team';

@Pipe({
  name: 'teamHasUpdate',
  pure: true
})
class TeamHasUpdate implements PipeTransform {
  transform(input: any) {
    return input.filter(team => team.getLastUpdate())
  }
}

@Component({
  selector: 'public-map',
  templateUrl: './public-map.template.html',
  styleUrls: ['./public-map.styles.scss'],
  pipes: [TeamHasUpdate]
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
    iconUrl: 'http://localhost:3000/assets/map-pin/Map_marker-64.png'
  }

  whut(team) {
    console.log(team);
    return JSON.stringify(team);
  }

  //50.0718908,14.4462584
  //53.612805,5.301865,

  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    this.dataService.getPublicTeams()
      .then(teams => this.teams = teams);
  }
}