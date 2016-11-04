import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import { Team } from "../../../common/team";
import {
  TeamStatus,
  Location,
  LOCATION_SOURCE,
  prettyStatusName
} from "../../../common/update";
import { Text, AppText } from "../../../common/text";

import { DataService } from '../../data.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'new-update',
  templateUrl: './new-update.template.html',
  styleUrls: ['./new-update.styles.scss']
})
export class NewUpdateComponent implements OnInit {
  @Input() team: Team;
  @Input() text: Text;
  @Output() onStatusCreated = new EventEmitter();
  newStatusObj = {
    status: TeamStatus.ON_START_BUS,
    location: {
      place: 'St Andrews',
      latitude: 56.3397753,
      longitude: -2.7967214,
      accuracy: 0,
      source: LOCATION_SOURCE.MANUAL
    },
    notes: "Default starting status",
    isPublic: false,
    byUser: undefined
  }
  statusEnum = TeamStatus;
  default = {
    lat: 53.612805,
    lng: 5.301865,
    zoom: 4,
    iconUrl: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
  }

  constructor(
    private dataService: DataService,
    private userService: UserService
  ) {}

  ngOnInit() {
    let lastUpdate = this.team.getLastUpdate();
    if (lastUpdate) {
      this.newStatusObj.status = lastUpdate.status;
      this.newStatusObj.location = lastUpdate.location;
    }
    if (this.text instanceof AppText) {
      this.newStatusObj.location = this.text.location;
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
    this.newStatusObj.byUser = this.userService.getUserAction();
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
