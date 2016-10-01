import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Team } from "../../../common/team";
import { TeamStatus, Location } from "../../../common/update";

import { DataService } from '../../data.service';

@Component({
  selector: 'new-update',
  templateUrl: './new-update.template.html',
  styleUrls: ['./new-update.styles.scss']
})
export class NewUpdateComponent {
  @Input() team: Team;
  @Output() onStatusCreated = new EventEmitter();
  newStatusObj = {
    location: new Location()
  }
  statusEnum = TeamStatus;
  default = {
    lat: 53.612805,
    lng: 5.301865,
    zoom: 4,
    iconUrl: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
  }

  constructor(private dataService: DataService) {

  }

  saveNewUpdate() {
    this.dataService.createStatusUpdateForTeam(this.newStatusObj, this.team)
      .then(team => {
        this.team = team
        this.onStatusCreated.emit();
      });
  }

  onMarkerDragEnd(event) {
    this.newStatusObj.location.latitude = event.coords.lat;
    this.newStatusObj.location.longitude = event.coords.lng;
  }
}
