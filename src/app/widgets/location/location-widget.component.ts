import { Component, Input } from "@angular/core";

import { Location, LOCATION_SOURCES } from "../../../common/update";

@Component({
  selector: 'location-widget',
  templateUrl: './location-widget.component.html',
  styleUrls: ['./location-widget.component.scss']
})
export class LocationWidget {
  @Input() location: Location;

  ifGPS() {
    return this.location.source == LOCATION_SOURCES.GPS;
  }

  ifNetwork() {
    return this.location.source == LOCATION_SOURCES.NETWORK;
  }

  ifManual() {
    return !this.location.source || this.location.source == LOCATION_SOURCES.MANUAL;
  }
}
