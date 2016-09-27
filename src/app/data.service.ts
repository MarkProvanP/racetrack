import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';
import * as _ from "lodash";
import 'rxjs/add/operator/toPromise';

import { Team, TeamId } from '../common/team';
import { Racer, RacerId } from '../common/racer';
import { TeamUpdate } from '../common/update';
import { Text, PhoneNumber } from '../common/text';
import { TextReceivedMessage } from "../common/message";

type textCallback = (Text) => void;

@Injectable()
export class DataService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private backendHost = "https://mrp4.host.cs.st-andrews.ac.uk";
  private baseUrl = this.backendHost + "/r2bcknd/";
  private teamsUrl = this.baseUrl + 'teams';  // URL to web api
  private racersUrl = this.baseUrl + 'racers';
  private textsUrl = this.baseUrl + "texts";
  private updatesUrl = this.baseUrl + "updates";
  private socket;

  private textReceivers: [textCallback] = <[textCallback]>[];

  constructor(private http: Http) {
    this.socket = io(this.backendHost, {path: "/r2bcknd/socket.io"});
    this.socket.on(TextReceivedMessage.event, (messageString) => {
      let parsed = JSON.parse(messageString);
      let message = TextReceivedMessage.fromJSON(parsed);
      console.log('Received message', message);
      let text = message.text;
      this.textReceivers.forEach(receiver => receiver(text));
    });
  }

  onTextReceived(callback: textCallback) {
    this.textReceivers.push(callback);
  }

  getTeams(): Promise<Team[]> {
    return this.http.get(this.teamsUrl)
               .toPromise()
               .then(response => response.json().map(Team.fromJSON))
               .catch(this.handleError);
  }

  getTeam(id: TeamId): Promise<Team> {
    let url = `${this.teamsUrl}/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => Team.fromJSON(response.json()))
      .catch(this.handleError);
  }

  deleteTeam(id: TeamId): Promise<void> {
    let url = `${this.teamsUrl}/${id}`;
    return this.http.delete(url, {body: "", headers: this.headers})
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  createTeam(properties): Promise<Team> {
    return this.http
      .post(this.teamsUrl, JSON.stringify(properties), {headers: this.headers})
      .toPromise()
      .then(res => Team.fromJSON(res.json()))
      .catch(this.handleError);
  }

  updateTeam(team: Team): Promise<Team> {
    const url = `${this.teamsUrl}/${team.id}`;
    return this.http
      .put(url, JSON.stringify(team), {headers: this.headers})
      .toPromise()
      .then(response => {
        let t = Team.fromJSON(response.json())
        return t;
      })
      .catch(this.handleError);
  }

  getRacers(): Promise<Racer[]> {
    return this.http.get(this.racersUrl)
               .toPromise()
               .then(response => response.json().map(Racer.fromJSON))
               .catch(this.handleError);
  }

  getRacer(id: RacerId): Promise<Racer> {
    let url = `${this.racersUrl}/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => Racer.fromJSON(response.json()))
      .catch(this.handleError)
  }

  deleteRacer(id: RacerId): Promise<void> {
    let url = `${this.racersUrl}/${id}`;
    return this.http.delete(url, {body: "", headers: this.headers})
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  createRacer(properties): Promise<Racer> {
    return this.http
      .post(this.racersUrl, JSON.stringify(properties), {headers: this.headers})
      .toPromise()
      .then(res => Racer.fromJSON(res.json()))
      .catch(this.handleError);
  }

  updateRacer(racer: Racer): Promise<Racer> {
    const url = `${this.racersUrl}/${racer.id}`;
    return this.http
      .put(url, JSON.stringify(racer), {headers: this.headers})
      .toPromise()
      .then(response => {
        let r = Racer.fromJSON(response.json())
        return r;
      })
      .catch(this.handleError);
  }

  getTexts(): Promise<[Text]> {
    return this.http.get(this.textsUrl)
      .toPromise()
      .then(response => response.json()
            .map(text => Text.fromJSON(text)))
      .catch(this.handleError);
  }

  updateText(text: Text): Promise<Text> {
    const url = `${this.textsUrl}/${text.id}`;
    return this.http
      .put(url, JSON.stringify(text), {headers: this.headers})
      .toPromise()
      .then(response => {
        let t = Text.fromJSON(response.json());
        return t;
      })
      .catch(this.handleError);
  }

  createStatusUpdateForTeam(statusObj, team: Team): Promise<Team> {
    return this.http.post(this.updatesUrl, JSON.stringify(statusObj), {headers: this.headers})
      .toPromise()
      .then(response => {
        let statusUpdate = TeamUpdate.fromJSON(response.json());
        team.statusUpdates.push(statusUpdate);
        return this.updateTeam(team);
      });
  }

  getRacersWithoutTeams(): Promise<[Racer]> {
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
      .then(racers => racers.filter(racer => racer.phone === phone)[0]);
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
