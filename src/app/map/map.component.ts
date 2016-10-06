import { Component, OnInit } from "@angular/core";

import { DataService } from '../data.service';

import { Team } from '../../common/team';

@Component({
  selector: 'map',
  templateUrl: './map.template.html',
  styleUrls: ['./map.styles.scss']
})
export class MapComponent implements OnInit {
  teams: Team[] = [];
  default = {
    lat: 53.612805,
    lng: 5.301865,
    zoom: 6,
    iconUrl: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
  }
  hostel = {
    lat: 50.0718908,
    lng: 14.4462584
  }

  //50.0718908,14.4462584
  //53.612805,5.301865,

  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    this.dataService.getTeams()
      .then(teams => this.teams = teams);
  }
}
