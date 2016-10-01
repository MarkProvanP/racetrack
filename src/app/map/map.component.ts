import { Component } from "@angular/core";

import { DataService } from '../data.service';

@Component({
  selector: 'map',
  templateUrl: './map.template.html',
  styleUrls: ['./map.styles.scss']
})
export class MapComponent {
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
}
