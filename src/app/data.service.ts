import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';
import * as _ from "lodash";
import 'rxjs/add/operator/toPromise';

import { Team, TeamId } from '../common/team';
import { Racer, RacerId } from '../common/racer';
import { TeamUpdate } from '../common/update';
import { PhoneNumber } from '../common/text';
import { UserService } from './user.service';

@Injectable()
export class DataService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private httpNoBodyExtras = {
    headers: this.headers,
    withCredentials: true,
    body: ''
  };
  private httpExtras = {
    headers: this.headers,
    withCredentials: true
  }
  private backendHost = "";
  private baseUrl = this.backendHost + "/r2bcknd/";
  private teamsUrl = this.baseUrl + 'teams';  // URL to web api
  private racersUrl = this.baseUrl + 'racers';
  private updatesUrl = this.baseUrl + "updates";
  private eventsUrl = this.baseUrl + "events";

  constructor(
    private http: Http,
    private userService: UserService
  ) {
    this.userService.addOnAuthStatusChangedListener(authenticated => {
      if (authenticated) {
        this.whenAuthenticated();
      } else {
        this.notAuthenticated();
      }
    });
  }

  private whenAuthenticated() {

  }

  private notAuthenticated() {

  }

  getTeams(): Promise<Team[]> {
    return this.http.get(this.teamsUrl, this.httpNoBodyExtras)
               .toPromise()
               .then(response => response.json().map(Team.fromJSON))
               .catch(this.handleError);
  }

  getTeam(id: TeamId): Promise<Team> {
    let url = `${this.teamsUrl}/${id}`;
    return this.http.get(url, this.httpNoBodyExtras)
      .toPromise()
      .then(response => Team.fromJSON(response.json()))
      .catch(this.handleError);
  }

  deleteTeam(id: TeamId): Promise<void> {
    let url = `${this.teamsUrl}/${id}`;
    return this.http.delete(url, this.httpNoBodyExtras)
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  createTeam(properties): Promise<Team> {
    return this.http
      .post(this.teamsUrl, JSON.stringify(properties), this.httpExtras)
      .toPromise()
      .then(res => Team.fromJSON(res.json()))
      .catch(this.handleError);
  }

  updateTeam(team: Team): Promise<Team> {
    const url = `${this.teamsUrl}/${team.id}`;
    return this.http
      .put(url, JSON.stringify(team), this.httpExtras)
      .toPromise()
      .then(response => {
        let t = Team.fromJSON(response.json())
        return t;
      })
      .catch(this.handleError);
  }

  getRacers(): Promise<Racer[]> {
    return this.http.get(this.racersUrl, this.httpNoBodyExtras)
               .toPromise()
               .then(response => response.json().map(Racer.fromJSON))
               .catch(this.handleError);
  }

  getRacer(id: RacerId): Promise<Racer> {
    let url = `${this.racersUrl}/${id}`;
    return this.http.get(url, this.httpNoBodyExtras)
      .toPromise()
      .then(response => Racer.fromJSON(response.json()))
      .catch(this.handleError)
  }

  deleteRacer(id: RacerId): Promise<void> {
    let url = `${this.racersUrl}/${id}`;
    return this.http.delete(url, this.httpNoBodyExtras)
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  createRacer(properties): Promise<Racer> {
    return this.http
      .post(this.racersUrl, JSON.stringify(properties), this.httpExtras)
      .toPromise()
      .then(res => Racer.fromJSON(res.json()))
      .catch(this.handleError);
  }

  updateRacer(racer: Racer): Promise<Racer> {
    const url = `${this.racersUrl}/${racer.id}`;
    return this.http
      .put(url, JSON.stringify(racer), this.httpExtras)
      .toPromise()
      .then(response => {
        let r = Racer.fromJSON(response.json())
        return r;
      })
      .catch(this.handleError);
  }

  createStatusUpdateForTeam(statusObj, team: Team): Promise<Team> {
    return this.http.post(this.updatesUrl, JSON.stringify(statusObj), this.httpExtras)
      .toPromise()
      .then(response => {
        let statusUpdate = TeamUpdate.fromJSON(response.json());
        team.statusUpdates.push(statusUpdate);
        return this.updateTeam(team);
      });
  }

  getRacersWithoutTeams(): Promise<Racer[]> {
    return this.getRacers()
      .then(racers => {
        return this.getTeams()
          .then(teams => {
            let racersInTeams = teams
              .map(team => team.racers)
              .reduce((a, b) => a.concat(b));
            let comp = (r1, r2) => r1.id === r2.id;
            let remaining = _.differenceWith(racers, racersInTeams, comp);
            return Promise.resolve(remaining);
          });
      });
  }

  getRacerForPhoneNumber(phone: PhoneNumber): Promise<Racer> {
    return this.getRacers()
      .then(racers => racers.filter(racer => racer.phones.filter(contact => contact.number === phone))[0]);
  }

  getTeamForRacer(racer: Racer): Promise<Team> {
    return this.getTeams()
      .then(teams => teams.filter(team => team.hasRacer(racer))[0]);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}



/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
