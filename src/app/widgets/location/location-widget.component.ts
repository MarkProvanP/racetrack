import { Component, Input } from "@angular/core";

import { Location, LOCATION_SOURCES } from "../../../common/update";

@Component({
  selector: 'location-widget',
  templateUrl: './location-widget.component.html',
  styleUrls: ['./location-widget.component.scss']
})
export class LocationWidget {
  @Input() location: Location;
  @Input() showCoords: boolean;
  @Input() hidePlace: boolean;

  ifGPS() {
    return this.location.source == LOCATION_SOURCES.GPS;
  }

  ifNetwork() {
    return this.location.source == LOCATION_SOURCES.NETWORK;
  }

  ifManual() {
    return !this.location.source || this.location.source == LOCATION_SOURCES.MANUAL;
  }

  getTooltip() {
    let location = this.location;
    let latitude = location.latitude;
    let longitude = location.longitude;
    let accuracy = location.accuracy;
    let place = location.place;
    if (this.ifGPS()) {
        return `Location from GPS: lat: ${latitude}, long: ${longitude}, accuracy: ${accuracy}, placename: ${place}`

    }
    if (this.ifNetwork()) {
        return `Location from network: lat: ${latitude}, long: ${longitude}, accuracy: ${accuracy}, placename: ${place}`

    }
    if (this.ifManual()) {
        return `Location set manually: lat: ${latitude}, long: ${longitude}, placename: ${place}`
    }
  }
}
