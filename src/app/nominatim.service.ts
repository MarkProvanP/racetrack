import { Injectable } from "@angular/core";
import { Http, URLSearchParams } from "@angular/http";

import { Location } from "../common/update";

@Injectable()
export class NominatimService {
  private searchUrl = "https://nominatim.openstreetmap.org/search"
  private reverseUrl = "https://nominatim.openstreetmap.org/reverse"
  constructor(private http: Http) {}

  reverseGeocode(location: Location) {
    let lat = String(location.latitude);
    let lon = String(location.longitude);
    let zoom = String(13);

    let params = new URLSearchParams();
    params.set('lat', lat);
    params.set('lon', lon);
    params.set('format', 'json');
    params.set('zoom', zoom);

    return this.http.get(this.reverseUrl, {
      search: params
    })
    .toPromise()
    .then(res => res.json())
  }

  search(query) {
    let params = new URLSearchParams();
    params.set('q', query);
    params.set('format', 'json')
    return this.http.get(this.searchUrl, {
      search: params
    })
    .toPromise()
    .then(res => res.json())
  }
}
