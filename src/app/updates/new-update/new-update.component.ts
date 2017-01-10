import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";

import { Team } from "../../../common/team";
import {
  TeamStatus,
  Location,
  LOCATION_SOURCES,
  prettyStatusName
} from "../../../common/update";
import { Text, AppText } from "../../../common/text";

import { DataService } from '../../data.service';
import { UserService } from '../../user.service';
import { NominatimService } from "../../nominatim.service";

@Component({
  selector: 'new-update',
  templateUrl: './new-update.component.pug',
  styleUrls: ['./new-update.component.scss']
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
      source: LOCATION_SOURCES.MANUAL
    },
    notes: "Drop off location!",
    isPublic: false,
    byUser: undefined,
    linkedTexts: []
  }
  statusEnum = TeamStatus;
  mapSettings = {
    lat: 53.612805,
    lng: 5.301865,
    zoom: 4,
    iconUrl: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
  }

  placeSuggestion: string;

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private nominatim: NominatimService
  ) {}

  ngOnInit() {
    let originalLastUpdate = this.team.getLastUpdate()
    if (originalLastUpdate) {
      let lastUpdate = originalLastUpdate.makeClone();
      this.newStatusObj.status = lastUpdate.status;
      this.newStatusObj.location = lastUpdate.location;
    }
    if (this.text instanceof AppText) {
      this.newStatusObj.location = JSON.parse(JSON.stringify(this.text.location));
    }
    if (this.text) {
      this.newStatusObj.linkedTexts = [this.text.id];
    }
    this.reverseGeocodeLocation();
  }

  getPrettyStatusName(item) {
    return prettyStatusName(item.key);
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

  searchForPlace() {
    this.placeSuggestion = "";
    this.nominatim.search(this.newStatusObj.location.place)
    .then(res => {
      if (res.length) {
        let topResult = res[0];
        let lat = (Number(topResult.boundingbox[0]) + Number(topResult.boundingbox[1]))/2;
        let lon = (Number(topResult.boundingbox[2]) + Number(topResult.boundingbox[3]))/2;
        this.newStatusObj.location.latitude = lat;
        this.newStatusObj.location.longitude = lon;
        this.newStatusObj.location.place = topResult.display_name;
        this.mapSettings.lat = lat;
        this.mapSettings.lng = lon;
      }
    })
  }

  reverseGeocodeLocation() {
    this.nominatim.reverseGeocode(this.newStatusObj.location)
    .then(res => {
      this.placeSuggestion = res.display_name;
    })
  }

  onMarkerDragEnd(event) {
    this.newStatusObj.location.latitude = event.coords.lat;
    this.newStatusObj.location.longitude = event.coords.lng;
    this.reverseGeocodeLocation();
  }
}
