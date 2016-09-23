import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Team } from '../common/team';
import { Racer } from '../common/racer';

@Injectable()
export class DataService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private baseUrl = "https://mrp4.host.cs.st-andrews.ac.uk/r2bcknd/";
  private teamsUrl = this.baseUrl + 'teams';  // URL to web api
  private racersUrl = this.baseUrl + 'racers';

  constructor(private http: Http) {

  }

  getTeams(): Promise<Team[]> {
    return this.http.get(this.teamsUrl)
               .toPromise()
               .then(response => response.json() as Team[])
               .catch(this.handleError);
  }

  getTeam(id: number): Promise<Team> {
    return this.getTeams()
               .then(teams => teams.find(team => team.id === id));
  }

  deleteTeam(id: number): Promise<void> {
    let url = `${this.teamsUrl}/${id}`;
    return this.http.delete(url, {headers: this.headers})
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  createTeam(name: string): Promise<Team> {
    return this.http
      .post(this.teamsUrl, JSON.stringify({name: name}), {headers: this.headers})
      .toPromise()
      .then(res => res.json().data)
      .catch(this.handleError);
  }

  updateTeam(team: Team): Promise<Team> {
    const url = `${this.teamsUrl}/${team.id}`;
    return this.http
      .put(url, JSON.stringify(team), {headers: this.headers})
      .toPromise()
      .then(() => team)
      .catch(this.handleError);
  }

  getRacers(): Promise<Racer[]> {
    return this.http.get(this.racersUrl)
               .toPromise()
               .then(response => response.json() as Racer[])
               .catch(this.handleError);
  }

  getRacer(id: number): Promise<Racer> {
    return this.getRacers()
               .then(racers => racers.find(racer => racer.id === id));
  }

  deleteRacer(id: number): Promise<void> {
    let url = `${this.racersUrl}/${id}`;
    return this.http.delete(url, {headers: this.headers})
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  createRacer(name: string): Promise<Racer> {
    return this.http
      .post(this.racersUrl, JSON.stringify({name: name}), {headers: this.headers})
      .toPromise()
      .then(res => res.json().data)
      .catch(this.handleError);
  }

  updateRacer(racer: Racer): Promise<Racer> {
    const url = `${this.racersUrl}/${racer.id}`;
    return this.http
      .put(url, JSON.stringify(racer), {headers: this.headers})
      .toPromise()
      .then(() => racer)
      .catch(this.handleError);
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
