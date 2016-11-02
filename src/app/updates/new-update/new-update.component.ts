import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import { Team } from "../../../common/team";
import { TeamStatus, Location, prettyStatusName } from "../../../common/update";

import { DataService } from '../../data.service';

@Component({
  selector: 'new-update',
  templateUrl: './new-update.template.html',
  styleUrls: ['./new-update.styles.scss']
})
export class NewUpdateComponent implements OnInit {
  @Input() team: Team;
  @Output() onStatusCreated = new EventEmitter();
  newStatusObj = {
    status: TeamStatus.ON_START_BUS,
    location: {
      place: 'St Andrews',
      latitude: 56.3397753,
      longitude: -2.7967214
    },
    notes: "Default starting status",
    isPublic: false
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

  ngOnInit() {
    let lastUpdate = this.team.getLastUpdate();
    if (lastUpdate) {
      this.newStatusObj.status = lastUpdate.status;
      this.newStatusObj.location = lastUpdate.location;
    }
  }

  getPrettyStatusName(item) {
    let enumVal = TeamStatus[item.value];
    return prettyStatusName(enumVal);
  }

  cancelNewUpdate() {
    this.onStatusCreated.emit();
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

  toNumber(s) {
    return Number(s);
  }
}
